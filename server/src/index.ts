import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import { Resolvers } from "./__generated__/resolvers-types";

const typeDefs = readFileSync("../schema.graphql", { encoding: "utf-8" });

const authors = [
  { id: 0, name: "Leo Tolstoy", bio: "Prolific Russian author" },
  { id: 1, name: "Cixin Liu", bio: "Chinese sci-fi author" },
];

const books = [
  {
    title: "War and Peace",
    author: { id: 0, name: "Leo Tolstoy", bio: "Prolific Russian author" },
    isbn: "9781420953503",
  },
  {
    title: "Death's End",
    author: { id: 1, name: "Cixin Liu", bio: "Chinese sci-fi author" },
    isbn: "9780765377104",
  },
];

const head = <T>(xs: Array<T>) => xs[0];

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers: Resolvers = {
  Query: {
    listBooks: (parent, args, context, info) => books,
    getBook: (parent, args, context, info) =>
      head(books.filter((x) => x.isbn === args.isbn)),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Serve an introspection endpoint so clients can fetch the schema
  // definitions.
  introspection: true,
});

startStandaloneServer(server).then((url) =>
  console.log(`🚀  Server ready at ${url.url}`)
);
