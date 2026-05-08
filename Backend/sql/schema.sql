-- =============================================================
-- Library Management System — MySQL schema (3NF, InnoDB, utf8mb4)
-- =============================================================
CREATE DATABASE IF NOT EXISTS library_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_db;

-- Drop in dependency order (safe re-run)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs, fines, reservations, transactions,
  book_copies, book_authors, books, authors, categories, users;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------
-- USERS  (Admin / Librarian / Member)
-- -------------------------------------------------------------
CREATE TABLE users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100)     NOT NULL,
  email           VARCHAR(150)     NOT NULL UNIQUE,
  password_hash   VARCHAR(255)     NOT NULL,
  role            ENUM('admin','librarian','member') NOT NULL DEFAULT 'member',
  phone           VARCHAR(20),
  is_active       TINYINT(1)       NOT NULL DEFAULT 1,
  created_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- CATEGORIES  (Fiction, Science, ...)
-- -------------------------------------------------------------
CREATE TABLE categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- AUTHORS
-- -------------------------------------------------------------
CREATE TABLE authors (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(150) NOT NULL,
  bio       TEXT,
  INDEX idx_authors_name (name)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- BOOKS  (one logical title; physical copies live in book_copies)
-- -------------------------------------------------------------
CREATE TABLE books (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  isbn            VARCHAR(20)  UNIQUE,
  category_id     INT,
  publisher       VARCHAR(150),
  published_year  SMALLINT,
  description     TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_books_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_books_title (title),
  FULLTEXT INDEX ft_books_title_desc (title, description)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- BOOK_AUTHORS  (many-to-many: a book may have multiple authors)
-- -------------------------------------------------------------
CREATE TABLE book_authors (
  book_id   INT NOT NULL,
  author_id INT NOT NULL,
  PRIMARY KEY (book_id, author_id),
  CONSTRAINT fk_ba_book   FOREIGN KEY (book_id)   REFERENCES books(id)   ON DELETE CASCADE,
  CONSTRAINT fk_ba_author FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- BOOK_COPIES  (one row per physical copy)
-- status: available | issued | reserved | lost | maintenance
-- -------------------------------------------------------------
CREATE TABLE book_copies (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  book_id      INT NOT NULL,
  barcode      VARCHAR(50) NOT NULL UNIQUE,
  status       ENUM('available','issued','reserved','lost','maintenance')
               NOT NULL DEFAULT 'available',
  shelf_loc    VARCHAR(50),
  CONSTRAINT fk_copies_book FOREIGN KEY (book_id)
    REFERENCES books(id) ON DELETE CASCADE,
  INDEX idx_copies_status (book_id, status)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- TRANSACTIONS  (issue / return ledger)
-- -------------------------------------------------------------
CREATE TABLE transactions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  copy_id       INT NOT NULL,
  issued_by     INT,                       -- librarian who issued
  issued_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_at        DATETIME NOT NULL,
  returned_at   DATETIME NULL,
  status        ENUM('issued','returned','overdue') NOT NULL DEFAULT 'issued',
  CONSTRAINT fk_tx_user   FOREIGN KEY (user_id)   REFERENCES users(id),
  CONSTRAINT fk_tx_copy   FOREIGN KEY (copy_id)   REFERENCES book_copies(id),
  CONSTRAINT fk_tx_issuer FOREIGN KEY (issued_by) REFERENCES users(id),
  INDEX idx_tx_user_status (user_id, status),
  INDEX idx_tx_copy_status (copy_id, status)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- RESERVATIONS  (queue when no copy available)
-- -------------------------------------------------------------
CREATE TABLE reservations (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  book_id      INT NOT NULL,
  reserved_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status       ENUM('active','fulfilled','cancelled','expired')
               NOT NULL DEFAULT 'active',
  CONSTRAINT fk_res_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_res_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  INDEX idx_res_book_status (book_id, status),
  UNIQUE KEY uniq_active_res (user_id, book_id, status)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- FINES  (one row per overdue/lost transaction)
-- -------------------------------------------------------------
CREATE TABLE fines (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id  INT NOT NULL,
  user_id         INT NOT NULL,
  amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid            TINYINT(1) NOT NULL DEFAULT 0,
  paid_at         DATETIME NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fine_tx   FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  CONSTRAINT fk_fine_user FOREIGN KEY (user_id)        REFERENCES users(id)        ON DELETE CASCADE,
  INDEX idx_fines_user_paid (user_id, paid)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- AUDIT_LOGS  (optional — track admin/librarian actions)
-- -------------------------------------------------------------
CREATE TABLE audit_logs (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id    INT,
  action      VARCHAR(100) NOT NULL,
  entity      VARCHAR(50),
  entity_id   INT,
  meta        JSON,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_actor (actor_id),
  INDEX idx_audit_entity (entity, entity_id)
) ENGINE=InnoDB;
