import { useEffect, useState } from "react";
import { graphql } from "./__generated__/gql";
import { execute } from "./client";
import { ListBooksQuery } from "./__generated__/graphql";
import { Book } from "./Book";

const listBooksQuery = graphql(`
  query ListBooks {
    books {
      ...BookFragment
    }
  }
`);

export function Books() {
  const [data, setData] = useState<ListBooksQuery>();
  useEffect(() => {
    execute(listBooksQuery).then((res) => setData(res));
  }, []);

  return (
    <div>
      {data?.books?.map((book) => (
        <Book book={book} />
      ))}
    </div>
  );
}
