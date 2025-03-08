import { describe, expect, it } from "vitest";

// These tests require hasura to be running.
describe("e2e demo", () => {
  const listBooksQuery = `
    query ListBooks($after: String, $first: Int = 10) {
      booksConnection(after: $after, first: $first) {
        edges {
          node {
            ...BookFragment
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    fragment BookFragment on Books {
      title
      author {
        ...AuthorFragment
      }
    }
    fragment AuthorFragment on Authors {
      name
      bio
    }
  `;

  it("should return a list of books", async () => {
    // send our request to the url of the test server
    const response = await fetch("http://localhost:8080/v1beta1/relay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
      },
      body: JSON.stringify({
        query: listBooksQuery,
      }),
    }).then((res) => res.json());
    expect((response as any).errors).toBeUndefined();
    console.log(JSON.stringify(response.data));
    expect(response.data).toEqual({
      booksConnection: {
        edges: [
          {
            node: {
              title: "War and Peace",
              author: { name: "Leo Tolstoy", bio: "Prolific Russian author" },
            },
          },
          {
            node: {
              title: "Death's End",
              author: { name: "Cixin Liu", bio: null },
            },
          },
          {
            node: {
              title: "Educated",
              author: { name: "Tara Westover", bio: null },
            },
          },
          {
            node: {
              title:
                "Regenesis: Feeding the World Without Devouring the Planet",
              author: { name: "George Monbiot", bio: null },
            },
          },
          {
            node: {
              title: "Anna Karenina",
              author: { name: "Leo Tolstoy", bio: "Prolific Russian author" },
            },
          },
          {
            node: {
              title: "Four Thousand Weeks: Time Management for Mortals",
              author: { name: "Oliver Burkeman", bio: null },
            },
          },
          {
            node: {
              title: "An example book",
              author: { name: "name", bio: null },
            },
          },
          {
            node: {
              title: "An example book",
              author: { name: "name", bio: null },
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: "eyJpc2JuIiA6ICIwMDAwMDAwMDAwMDAxIn0=",
        },
      },
    });
  });

  const listOrdersQuery = `
    query ListOrders($after: String, $first: Int = 10) {
      ordersConnection(after: $after, first: $first) {
        edges {
          node {
            ...OrderFragment
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
    fragment OrderFragment on Orders {
      id
      status
      orderItems {
        ...OrderItemFragment
      }
    }
    fragment OrderItemFragment on OrderItems {
      id
      price
      quantity
      product {
        ...ProductFragment
      }
    }
    fragment ProductFragment on Products {
      id
      name
      price
      stock
    }
  `;

  it("should return a list of orders", async () => {
    // send our request to the url of the test server
    const response = await fetch("http://localhost:8080/v1beta1/relay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
      },
      body: JSON.stringify({ query: listOrdersQuery }),
    }).then((res) => res.json());
    console.log(JSON.stringify(response.data));
    expect((response as any).errors).toBeUndefined();
    expect(response.data).toEqual({
      ordersConnection: {
        edges: [
          {
            node: {
              id: "WzEsICJwdWJsaWMiLCAib3JkZXJzIiwgMV0=",
              status: "PAID",
              orderItems: [
                {
                  id: "WzEsICJwdWJsaWMiLCAib3JkZXJfaXRlbXMiLCAxXQ==",
                  price: 2.5,
                  quantity: 2,
                  product: {
                    id: "WzEsICJwdWJsaWMiLCAicHJvZHVjdHMiLCAxXQ==",
                    name: "Apple",
                    price: 2.5,
                    stock: 0,
                  },
                },
                {
                  id: "WzEsICJwdWJsaWMiLCAib3JkZXJfaXRlbXMiLCAyXQ==",
                  price: 3.49,
                  quantity: 1,
                  product: {
                    id: "WzEsICJwdWJsaWMiLCAicHJvZHVjdHMiLCAyXQ==",
                    name: "Banana",
                    price: 3.49,
                    stock: 10,
                  },
                },
              ],
            },
          },
          {
            node: {
              id: "WzEsICJwdWJsaWMiLCAib3JkZXJzIiwgMTA4XQ==",
              status: "PAID",
              orderItems: [
                {
                  id: "WzEsICJwdWJsaWMiLCAib3JkZXJfaXRlbXMiLCAyMTNd",
                  price: 20,
                  quantity: 1,
                  product: {
                    id: "WzEsICJwdWJsaWMiLCAicHJvZHVjdHMiLCAxXQ==",
                    name: "Apple",
                    price: 2.5,
                    stock: 0,
                  },
                },
                {
                  id: "WzEsICJwdWJsaWMiLCAib3JkZXJfaXRlbXMiLCAyMTRd",
                  price: 20,
                  quantity: 1,
                  product: {
                    id: "WzEsICJwdWJsaWMiLCAicHJvZHVjdHMiLCAxXQ==",
                    name: "Apple",
                    price: 2.5,
                    stock: 0,
                  },
                },
              ],
            },
          },
          {
            node: {
              id: "WzEsICJwdWJsaWMiLCAib3JkZXJzIiwgMTA5XQ==",
              status: "PAID",
              orderItems: [
                {
                  id: "WzEsICJwdWJsaWMiLCAib3JkZXJfaXRlbXMiLCAyMTVd",
                  price: 20,
                  quantity: 1,
                  product: {
                    id: "WzEsICJwdWJsaWMiLCAicHJvZHVjdHMiLCAxXQ==",
                    name: "Apple",
                    price: 2.5,
                    stock: 0,
                  },
                },
                {
                  id: "WzEsICJwdWJsaWMiLCAib3JkZXJfaXRlbXMiLCAyMTZd",
                  price: 20,
                  quantity: 1,
                  product: {
                    id: "WzEsICJwdWJsaWMiLCAicHJvZHVjdHMiLCAxXQ==",
                    name: "Apple",
                    price: 2.5,
                    stock: 0,
                  },
                },
              ],
            },
          },
          {
            node: {
              id: "WzEsICJwdWJsaWMiLCAib3JkZXJzIiwgMTEwXQ==",
              status: "PAID",
              orderItems: [
                {
                  id: "WzEsICJwdWJsaWMiLCAib3JkZXJfaXRlbXMiLCAyMTdd",
                  price: 20,
                  quantity: 1,
                  product: {
                    id: "WzEsICJwdWJsaWMiLCAicHJvZHVjdHMiLCAxXQ==",
                    name: "Apple",
                    price: 2.5,
                    stock: 0,
                  },
                },
                {
                  id: "WzEsICJwdWJsaWMiLCAib3JkZXJfaXRlbXMiLCAyMThd",
                  price: 20,
                  quantity: 1,
                  product: {
                    id: "WzEsICJwdWJsaWMiLCAicHJvZHVjdHMiLCAxXQ==",
                    name: "Apple",
                    price: 2.5,
                    stock: 0,
                  },
                },
              ],
            },
          },
          {
            node: {
              id: "WzEsICJwdWJsaWMiLCAib3JkZXJzIiwgMzFd",
              status: "PAID",
              orderItems: [
                {
                  id: "WzEsICJwdWJsaWMiLCAib3JkZXJfaXRlbXMiLCA1OV0=",
                  price: 20,
                  quantity: 1,
                  product: {
                    id: "WzEsICJwdWJsaWMiLCAicHJvZHVjdHMiLCAxXQ==",
                    name: "Apple",
                    price: 2.5,
                    stock: 0,
                  },
                },
                {
                  id: "WzEsICJwdWJsaWMiLCAib3JkZXJfaXRlbXMiLCA2MF0=",
                  price: 20,
                  quantity: 1,
                  product: {
                    id: "WzEsICJwdWJsaWMiLCAicHJvZHVjdHMiLCAxXQ==",
                    name: "Apple",
                    price: 2.5,
                    stock: 0,
                  },
                },
              ],
            },
          },
          {
            node: {
              id: "WzEsICJwdWJsaWMiLCAib3JkZXJzIiwgMzJd",
              status: "PAID",
              orderItems: [
                {
                  id: "WzEsICJwdWJsaWMiLCAib3JkZXJfaXRlbXMiLCA2MV0=",
                  price: 20,
                  quantity: 1,
                  product: {
                    id: "WzEsICJwdWJsaWMiLCAicHJvZHVjdHMiLCAxXQ==",
                    name: "Apple",
                    price: 2.5,
                    stock: 0,
                  },
                },
                {
                  id: "WzEsICJwdWJsaWMiLCAib3JkZXJfaXRlbXMiLCA2Ml0=",
                  price: 20,
                  quantity: 1,
                  product: {
                    id: "WzEsICJwdWJsaWMiLCAicHJvZHVjdHMiLCAxXQ==",
                    name: "Apple",
                    price: 2.5,
                    stock: 0,
                  },
                },
              ],
            },
          },
        ],
        pageInfo: { endCursor: "eyJpZCIgOiAzMn0=", hasNextPage: false },
      },
    });
  });
});
