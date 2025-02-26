import { useState } from "react";
import {
  FragmentType,
  getFragmentData,
} from "./__generated__/fragment-masking";
import { graphql } from "./__generated__/gql";
import { Author } from "./Author";
import { execute } from "./client";

export const BookFragment = graphql(`
  fragment BookFragment on Books {
    isbn
    title
    author {
      ...AuthorFragment
    }
  }
`);

export const UpdateBook = graphql(`
  mutation UpdateBook($isbn: String!, $_set: BooksSetInput!) {
    updateBooksByPk(pkColumns: { isbn: $isbn }, _set: $_set) {
      ...BookFragment
    }
  }
`);

export const Book = (props: { book: FragmentType<typeof BookFragment> }) => {
  const book = getFragmentData(BookFragment, props.book);
  const [title, setTitle] = useState(book.title);
  return (
    <div>
      <p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <button
          onClick={() => {
            execute(UpdateBook, {
              isbn: book.isbn,
              _set: { title: "Updated" },
            }).then((res) => console.log(res));
          }}
        >
          save
        </button>
      </p>
      <p>{book.author && <Author author={book.author} />}</p>
    </div>
  );
};
