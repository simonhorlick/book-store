import { relations, sql } from "drizzle-orm";
import {
  bigint,
  check,
  doublePrecision,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const authorTable = pgTable("authors", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  bio: text(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});

export const bookTable = pgTable("books", {
  isbn: varchar({ length: 13 }).notNull().primaryKey(),
  title: text().notNull(),
  authorId: bigint("author_id", { mode: "number" })
    .notNull()
    .references(() => authorTable.id),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});

export const productTable = pgTable(
  "products",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    stock: integer().notNull(),
    price: doublePrecision().notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    }).defaultNow(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    }).defaultNow(),
  },
  (table) => [
    // can't have negative stock levels
    check("product_stock_gt_0_ck", sql`${table.stock} >= 0`),
  ]
);

export const ordersTable = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  status: text().notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});

export const ordersRelations = relations(ordersTable, ({ many }) => ({
  items: many(orderItemTable),
}));

export const orderItemTable = pgTable("order_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  orderId: bigint("order_id", { mode: "number" })
    .notNull()
    .references(() => ordersTable.id),
  productId: bigint("product_id", { mode: "number" })
    .notNull()
    .references(() => productTable.id),
  quantity: integer().notNull(),
  price: doublePrecision().notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});

export const orderItemsRelation = relations(
  orderItemTable,
  ({ one, many }) => ({
    order: one(ordersTable, {
      fields: [orderItemTable.orderId],
      references: [ordersTable.id],
    }),
    product: one(productTable, {
      fields: [orderItemTable.productId],
      references: [productTable.id],
    }),
  })
);

// export const orderItemTableRelations = relations(
//   orderItemTable,
//   ({ one, many }) => ({
//     product: one(productTable),
//   })
// );
