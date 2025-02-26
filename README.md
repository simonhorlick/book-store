# book-store

An example graphql client.

## Getting started

```bash
npm install
npm run dev
```

## Open questions

- What does it look like with a hasura schema?
  - Can we generate client stubs for this that aren't crazy?
  - What is the ideal client code, subscribe to a resource and get all of its
    fields in the response?
  - What about nested objects?
- Is there a better way to do the codegen that doesn't break if there's a
  syntax error in the file?
- How do we do pagination?
  - Add limit and offset to each resource?
- How do we handle network errors?
- Should we do subscriptions?

- What do simple mutations look like?
  - Add a new book
  - How do we do field validations?
    - via CHECK constraints in postgres? if so how do we relate back constraint
      failures to the fields that caused them?
- What do more complex mutations look like?
  - Place an order and update the stock counts for all items, then send a
    confirmation email.
  - Can we force clients to handle certain responses such as
    InsufficientStockError?
  - What happens when a new error type is added, do clients fail to compile, or
    do they break silently, what is better?
