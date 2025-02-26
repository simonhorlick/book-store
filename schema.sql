CREATE FUNCTION trigger_set_timestamp()
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

    CONSTRAINT name_not_empty_ck CHECK (name <> '')
);

COMMENT ON TABLE authors IS 'An author of a book';
COMMENT ON COLUMN authors.name IS 'The name of the author. Cannot be empty.';
COMMENT ON COLUMN authors.bio IS 'A brief biography of the author';

CREATE TRIGGER set_timestamp_on_author
BEFORE
UPDATE ON authors
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE books (
    "isbn" VARCHAR(13) PRIMARY KEY,
    CONSTRAINT isbn_not_empty_ck CHECK (isbn <> ''),

    "title" TEXT NOT NULL,
    CONSTRAINT title_not_empty_ck CHECK (title <> ''),

    "author_id" BIGINT NOT NULL,
    CONSTRAINT fk_author_id FOREIGN KEY (author_id) REFERENCES authors (id),

    -- "rating" INT NOT NULL,
    -- -- This is the default name if we don't specify:
    -- CONSTRAINT book_rating_check CHECK(rating > 0 AND rating <= 10),

    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE books IS 'A single edition of a book';
COMMENT ON COLUMN books.title IS 'The title of the book. Cannot be empty.';
COMMENT ON COLUMN books.isbn IS 'The ISBN of the book. Must be a 10 or 13 digit ISBN.';
COMMENT ON COLUMN books.author_id IS 'The author of the book';

CREATE TRIGGER set_timestamp_on_book
BEFORE
UPDATE ON books
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

INSERT INTO authors ("name", "bio") VALUES ('Leo Tolstoy', 'Prolific Russian author');
INSERT INTO authors ("name", "bio") VALUES ('Cixin Liu', NULL);

INSERT INTO books ("isbn", "title", "author_id") VALUES ('9781420953503', 'War and Peace', 5);
INSERT INTO books ("isbn", "title", "author_id") VALUES ('9780765377104', 'Death''s End', 6);
