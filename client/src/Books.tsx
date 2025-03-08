import { useEffect, useState } from "react";
import { graphql } from "./__generated__/gql";
import { execute } from "./client";
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
    execute(listBooksQuery).then((res) => setBooks(res));
  }, []);

  return (
    <div>
      {books?.listBooks?.map((book) => (
        <Book book={book} />
      ))}
    </div>
  );
}
