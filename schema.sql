CREATE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE authors (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT name_not_empty_ck CHECK (name <> '' AND length(name) < 100),
    CONSTRAINT bio_length_ck CHECK (length(bio) < 10000)
);

COMMENT ON TABLE authors IS 'An author of a book';
COMMENT ON COLUMN authors.name IS 'The name of the author. Cannot be empty and must be less than 100 characters.';
COMMENT ON COLUMN authors.bio IS 'A brief biography of the author. Must be less than 10000 characters.';

CREATE TRIGGER set_timestamp_on_author
BEFORE
UPDATE ON authors
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();

CREATE TABLE books (
    "isbn" VARCHAR(13) PRIMARY KEY,
    CONSTRAINT isbn_not_empty_ck CHECK (isbn <> ''),


    "title" TEXT NOT NULL,
    CONSTRAINT title_not_empty_ck CHECK (title <> '' AND length(title) < 1000),

    "author_id" BIGINT NOT NULL,
    CONSTRAINT fk_author_id FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE,

    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE books IS 'A single edition of a book';
COMMENT ON COLUMN books.title IS 'The title of the book. Cannot be empty and must be less than 1000 characters.';
COMMENT ON COLUMN books.isbn IS 'The ISBN of the book. Must be a 10 or 13 digit ISBN.';
COMMENT ON COLUMN books.author_id IS 'The author of the book';

CREATE TRIGGER set_timestamp_on_book
BEFORE
UPDATE ON books
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();

INSERT INTO authors ("name", "bio") VALUES ('Leo Tolstoy', 'Prolific Russian author');
INSERT INTO authors ("name", "bio") VALUES ('Cixin Liu', NULL);
INSERT INTO authors ("name", "bio") VALUES ('Tara Westover', NULL);
INSERT INTO authors ("name", "bio") VALUES ('George Monbiot', NULL);
INSERT INTO authors ("name", "bio") VALUES ('Oliver Burkeman', NULL);

INSERT INTO books ("isbn", "title", "author_id") VALUES ('9781420953503', 'War and Peace', 1);
INSERT INTO books ("isbn", "title", "author_id") VALUES ('9780765377104', 'Death''s End', 2);
INSERT INTO books ("isbn", "title", "author_id") VALUES ('9780399590504', 'Educated', 3);
INSERT INTO books ("isbn", "title", "author_id") VALUES ('9780143135968', 'Regenesis: Feeding the World Without Devouring the Planet', 4);
INSERT INTO books ("isbn", "title", "author_id") VALUES ('9780345803924', 'Anna Karenina', 1);
INSERT INTO books ("isbn", "title", "author_id") VALUES ('9780374159122', 'Four Thousand Weeks: Time Management for Mortals', 5);


CREATE TABLE "products" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" TEXT NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,
  "stock" INT NOT NULL DEFAULT 0,

  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT products_stock_gt_0_ck CHECK (stock >= 0), -- can't have negative stock levels
  CONSTRAINT products_name_not_empty_ck CHECK (name <> '' AND length(name) < 100),
  CONSTRAINT products_price_gt_0_ck CHECK (price > 0)
);

CREATE TABLE "orders" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "status" TEXT NOT NULL,
  "email" TEXT CHECK ( email ~* '^.+@.+\..+$' ),

  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "order_items" (
  "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "order_id" BIGINT NOT NULL,
  "product_id" BIGINT NOT NULL,
  "quantity" INT NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,

  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_order_id FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE,
  CONSTRAINT fk_product_id FOREIGN KEY ("product_id") REFERENCES "products" ("id"),
  CONSTRAINT order_items_quantity_gt_0_ck CHECK (quantity > 0)
);

WITH
  apple AS (INSERT INTO "products" ("name","price","stock") VALUES ('Apple', 2.50, 10) RETURNING "id"),
  banana AS (INSERT INTO "products" ("name","price","stock") VALUES ('Banana', 3.49, 10) RETURNING "id"),
  o AS (INSERT INTO "orders" ("status") VALUES ('PAID') RETURNING "id")
INSERT INTO "order_items" (
    "order_id",
    "product_id",
    "quantity",
    "price"
)
  SELECT o.id, apple.id, 2, 2.50 FROM o, apple
  UNION ALL
  SELECT o.id, banana.id, 1, 3.49 FROM o, banana;
