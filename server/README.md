# book-store-server

This is an example server that serves an example graphql endpoint for the client.

## Hasura

Instead of a custom built server you can try:

```bash
createdb book_store
```

```bash
docker run -i --rm \
  --name hasura \
  --env-file=hasura.env \
  -p 8080:8080 \
  hasura/graphql-engine:v2.44.0
```
