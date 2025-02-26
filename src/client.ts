import type { TypedDocumentString } from "./__generated__/graphql";

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const response = await fetch("http://localhost:8080/v1/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/graphql-response+json",
      "x-hasura-admin-secret":
        "l84cu9DJuODPxpklhjmER4NQpjdPzSxk0cswnIjPLQugJvbSkhW62JG3tQ1pT1aEolevKhFCBa9TC1ldLpCnvsQT",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return (await response.json()).data as TResult;
}
