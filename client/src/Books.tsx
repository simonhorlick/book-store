import { useEffect, useState } from "react";
import { graphql } from "./__generated__/gql";
import { httpClient } from "./client";
import { ListBooksQuery } from "./__generated__/graphql";
import { Book } from "./Book";

const listBooksQuery = graphql(`
  query ListBooks {
    listBooks {
      ...BookFragment
    }
  }
`);

export function Books() {
  const [books, setBooks] = useState<ListBooksQuery>();
  useEffect(() => {
    const controller = new AbortController();
    httpClient
      .execute(listBooksQuery, controller, {})
      .then((res) => setBooks(res));
    return () => controller.abort();
  }, []);

  return (
    <div>
      {books?.listBooks?.map((book) => (
        <Book book={book} />
      ))}
    </div>
  );
}
