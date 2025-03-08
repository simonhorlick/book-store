DROP TRIGGER set_timestamp_on_author ON authors;
DROP TRIGGER set_timestamp_on_book ON books;
DROP TABLE authors CASCADE;
DROP TABLE books CASCADE;
DROP TABLE products CASCADE;
DROP TABLE orders CASCADE;
DROP TABLE order_items CASCADE;
DROP FUNCTION set_timestamp;