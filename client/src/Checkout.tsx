import { graphql } from "./__generated__/gql";
import { execute } from "./client";

export const CheckoutMutation = graphql(/* GraphQL */ `
  mutation Checkout($order: OrderInput) {
    checkout(order: $order) {
      __typename
      ... on FieldViolation {
        field
        code
        message
      }
      ... on Order {
        id
      }
      ... on InsufficientStockError {
        message
      }
      ... on InvalidPaymentMethodError {
        message
        paymentMethod
      }
    }
  }
`);

export function Checkout() {
  return (
    <button
      onClick={() => {
        execute(CheckoutMutation, {
          order: {
            items: [{ productId: 5, quantity: 1, price: 5.0 }],
            paymentMethod: "visa",
          },
        }).then((res) => {
          switch (res.checkout?.__typename) {
            case "FieldViolation":
              // TODO: show a human-readable error message alongside the
              // field input.
              console.log(
                `FieldViolation ${res.checkout.field} ${res.checkout.code}: ${res.checkout.message}`
              );
              return;
            case "InvalidPaymentMethodError":
              console.log(
                `InvalidPaymentMethodError ${res.checkout.paymentMethod}: ${res.checkout.message}`
              );
              return;
            case "InsufficientStockError":
              console.log(`InsufficientStockError ${res.checkout.message}`);
              return;
            case "Order":
              console.log(`Order ${res.checkout.id}`);
              return;
          }
          console.log(res);
        });
      }}
    >
      buy
    </button>
  );
}
