-- Sample seed data. Passwords below are bcrypt hashes of "Password123!"
USE library_db;

INSERT INTO users (name,email,password_hash,role) VALUES
 ('Admin User','admin@lib.com','$2a$10$wH8Q4i3l0E7pKQwQ8q5xQOQ1m8oG9E1vJ3eM3cR9a8sT0uYvB1Z9C','admin'),
 ('Lib Staff','librarian@lib.com','$2a$10$wH8Q4i3l0E7pKQwQ8q5xQOQ1m8oG9E1vJ3eM3cR9a8sT0uYvB1Z9C','librarian'),
 ('Alice Member','alice@lib.com','$2a$10$wH8Q4i3l0E7pKQwQ8q5xQOQ1m8oG9E1vJ3eM3cR9a8sT0uYvB1Z9C','member');

INSERT INTO categories (name) VALUES ('Fiction'),('Science'),('Technology'),('History');

INSERT INTO authors (name,bio) VALUES
 ('Robert C. Martin','Author of Clean Code'),
 ('Yuval Noah Harari','Historian'),
 ('Andrew Hunt','Pragmatic Programmer co-author');

INSERT INTO books (title,isbn,category_id,publisher,published_year,description) VALUES
 ('Clean Code','9780132350884',3,'Prentice Hall',2008,'A handbook of agile software craftsmanship'),
 ('Sapiens','9780062316097',4,'Harper',2014,'A brief history of humankind'),
 ('The Pragmatic Programmer','9780201616224',3,'Addison-Wesley',1999,'From journeyman to master');

INSERT INTO book_authors (book_id,author_id) VALUES (1,1),(2,2),(3,3);

INSERT INTO book_copies (book_id,barcode,status,shelf_loc) VALUES
 (1,'CC-001','available','A1'),(1,'CC-002','available','A1'),
 (2,'SAP-001','available','B2'),
 (3,'PP-001','available','A3'),(3,'PP-002','available','A3');
