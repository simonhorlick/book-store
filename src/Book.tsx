import {
  FragmentType,
  getFragmentData,
} from "./__generated__/fragment-masking";
import { graphql } from "./__generated__/gql";
import { Author } from "./Author";

export const BookFragment = graphql(`
  fragment BookFragment on Book {
    title
    author {
      ...AuthorFragment
    }
  }
`);

export const Book = (props: { book: FragmentType<typeof BookFragment> }) => {
  const book = getFragmentData(BookFragment, props.book);
  return (
    <div>
      <h3>{book.title}</h3>
      <p>{book.author && <Author author={book.author} />}</p>
    </div>
  );
};
