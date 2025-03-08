import { useEffect, useState } from "react";
import { graphql } from "./__generated__/gql";
import { execute } from "./client";
import { ListBooksQuery } from "./__generated__/graphql";
import { Book } from "./Book";

const listBooksQuery = graphql(`
  query ListBooks($after: String, $first: Int = 10) {
    # orderBy is necessary here for the cursor to work.
    booksConnection(first: $first, after: $after, orderBy: { isbn: ASC }) {
      edges {
        cursor
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
`);

export function Books() {
  const [data, setData] = useState<ListBooksQuery>();
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  useEffect(() => {
    execute(listBooksQuery, {
      after: cursor,
      first: 2,
    }).then((res) => setData(res));
  }, [cursor]);

  return (
    <div>
      {data?.booksConnection?.edges?.map((book) => (
        <div>
          {book.cursor} {atob(book.cursor)}: <Book book={book.node} />
        </div>
      ))}
      <div>
        <pre>{JSON.stringify(data?.booksConnection.pageInfo)}</pre>
        <pre>
          endCursor={atob(data?.booksConnection?.pageInfo?.endCursor ?? "")}
        </pre>
        {data?.booksConnection.pageInfo.hasNextPage && (
          <button
            onClick={() => {
              setCursor(data?.booksConnection?.pageInfo?.endCursor);
            }}
          >
            Next page
          </button>
        )}
      </div>
    </div>
  );
}
