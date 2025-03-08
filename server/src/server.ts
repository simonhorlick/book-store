import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import {
  Order,
  OrderItem,
  OrderItemInput,
  Product,
  Resolvers,
} from "./__generated__/resolvers-types";
import { check_violation } from "./db";
import { bookTable, ordersTable, orderItemTable, productTable } from "./schema";
import * as schema from "./schema";
import { eq } from "drizzle-orm/expressions";
import {
  InferResultType,
  InsufficientStockError,
  InvalidPaymentMethodError,
  RequiredField,
} from "./helpers";
import { DatabaseError } from "pg";
import { InferInsertModel, InferSelectModel } from "drizzle-orm/table";
import { sql } from "drizzle-orm/sql";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

const typeDefs = readFileSync("../schema.graphql", { encoding: "utf-8" });

const head = <T>(xs: Array<T>): T | null => xs[0] ?? null;

// Adapt a graphql OrderItemInput to an OrderItem model.
const OrderItemInputToOrderItem = (
  input: OrderItemInput,
  orderId: number
): InferInsertModel<typeof orderItemTable> => ({
  orderId: orderId,
  productId: input.productId,
  quantity: input.quantity,
  price: 20.0,
});

const ProductModelToProduct = (
  model: InferSelectModel<typeof productTable>
): Product => ({
  __typename: "Product",
  id: model.id,
  name: model.name,
  price: model.price,
  stock: model.stock,
});

export type OrderItemWithProduct = InferResultType<
  "orderItemTable",
  {
    product: true;
  }
>;

const OrderItemModelToOrderItem = (model: OrderItemWithProduct): OrderItem => ({
  __typename: "OrderItem",
  id: model.id,
  price: model.price,
  quantity: model.quantity,
  product: ProductModelToProduct(model.product!),
});

export type OrderWithItems = InferResultType<
  "ordersTable",
  {
    items: {
      with: {
        product: true;
      };
    };
  }
>;

// Adapt a CustomerOrder model to a graphql Order model.
const CustomerOrderToOrder = (order: OrderWithItems): Order =>
  ({
    __typename: "Order",
    id: order.id,
    status: order.status,
    items: order.items.map((item) => OrderItemModelToOrderItem(item)),
  } satisfies Order);

const resolvers: Resolvers<Context> = {
  Query: {
    listBooks: (_, args, ctx) =>
      ctx.db
        .select()
        .from(bookTable)
        .orderBy(bookTable.created_at)
        .limit(args.limit)
        .offset(args.offset),
    getBook: (_, args, ctx) =>
      ctx.db
        .select()
        .from(bookTable)
        .where(eq(bookTable.isbn, args.isbn))
        .then(head),
    listOrders: async (_, args, ctx) =>
      (
        await ctx.db.query.ordersTable.findMany({
          with: {
            items: {
              with: {
                product: true,
              },
            },
          },
        })
      ).map((x) => CustomerOrderToOrder(x)),
  },
  Mutation: {
    checkout: async (_, args, ctx) => {
      console.log(`args is ${JSON.stringify(args)}`);
      // Field validations
      if (args.order.paymentMethod === "") {
        return RequiredField(
          "order.paymentMethod",
          "Payment method is required"
        );
      }
      if (args.order.items.length === 0) {
        return RequiredField("order.items", "Items are required");
      }

      // Hard-coded.
      const allowedPaymentMethods = new Set<string>(["visa", "master"]);
      if (!allowedPaymentMethods.has(args.order.paymentMethod)) {
        return InvalidPaymentMethodError(
          `Payment method not supported. Please use one of: ${Array.from(
            allowedPaymentMethods
          ).join(", ")}`
        );
      }

      // FIXME: OrderItems can have multiple of the same product id. This might
      // break stock calculation logic.

      try {
        return await ctx.db.transaction(
          async (tx) => {
            console.log(`create order`);

            // Create the order.
            const order = head(
              await tx
                .insert(ordersTable)
                .values({
                  status: "PAID",
                })
                .returning()
            );
            if (order === null) {
              throw new Error("Order not created");
            }

            console.log(`create items`);
            // Create the order items.
            const orderItems = await tx
              .insert(orderItemTable)
              .values(
                args.order.items.map((item) =>
                  OrderItemInputToOrderItem(item, order.id)
                )
              )
              .returning();

            console.log(`update stock`);
            // Update the stock counts.
            // FIXME: This is incorrect if there are multiple of the same product in the order.
            for (const item of orderItems) {
              await tx
                .update(productTable)
                .set({
                  stock: sql`${productTable.stock} - ${item.quantity}`,
                })
                .where(eq(productTable.id, item.productId));
            }

            return head(
              (
                await tx.query.ordersTable.findMany({
                  with: {
                    items: {
                      with: {
                        product: true,
                      },
                    },
                  },
                  where: eq(ordersTable.id, order.id),
                })
              ).map((x) => CustomerOrderToOrder(x))
            )!;
          },
          // Lock the product rows until the transaction is committed.
          { isolationLevel: "repeatable read" }
        );
      } catch (e) {
        if (e instanceof DatabaseError) {
          if (
            e.code == check_violation &&
            e.constraint == "products_stock_gt_0_ck"
          ) {
            return InsufficientStockError("Insufficient stock");
          }
        }

        console.log(`${JSON.stringify(e)}`);

        // Unknown error.
        throw e;
      }
    },
  },
};

export interface Context {
  db: NodePgDatabase<typeof schema>;
}

export const createApolloServer = async (port: number, ctx: Context) => {
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    // Serve an introspection endpoint so clients can fetch the schema
    // definitions.
    introspection: true,
  });
  const url = await startStandaloneServer(server, {
    context: async () => ctx,
    listen: { port: port },
  });
  return { server, url: url.url };
};
