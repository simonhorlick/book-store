import {
  FragmentType,
  getFragmentData,
} from "./__generated__/fragment-masking";
import { graphql } from "./__generated__/gql";

export const AuthorFragment = graphql(`
  fragment AuthorFragment on Author {
    name
    bio
  }
`);

export const Author = (props: {
  author: FragmentType<typeof AuthorFragment>;
}) => {
  const author = getFragmentData(AuthorFragment, props.author);
  return (
    <div>
      <h3>{author.name}</h3>
      <p>{author.bio}</p>
    </div>
  );
};
