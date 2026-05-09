# 📚 Library Management System

A production-ready **Node.js + Express + MySQL** backend implementing a complete Library Management System with **JWT auth**, **role-based access control** (Admin / Librarian / Member), MVC architecture, and clean RESTful APIs.

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | **Node.js (>=18)** | async/await, modern JS |
| Framework | **Express.js** | minimal, battle-tested |
| Database | **MySQL 8** with **`mysql2/promise`** | We chose **mysql2** over Sequelize for transparent SQL, fine-grained transactions, row locks (`FOR UPDATE`) used by issue/return logic, and predictable indexing. |
| Auth | **JWT** + **bcryptjs** | stateless tokens + safe password hashing |
| Validation | **Joi** | schema-first request validation |
| Security | **helmet**, **cors**, **express-rate-limit** | HTTP hardening |

---

## 2. Project Structure (MVC)

```
library-management-system/
├── server.js            # boot + DB ping
├── app.js               # express app, middleware, route mounting
├── config/
│   └── db.js            # MySQL connection pool
├── controllers/         # request handlers (HTTP <-> models)
├── routes/              # RESTful route definitions + validation
├── models/              # data-access layer (parameterized SQL)
├── middleware/
│   ├── auth.js          # JWT + role authorization
│   ├── validate.js      # Joi validator factory
│   ├── asyncHandler.js  # try/catch wrapper for async controllers
│   └── errorHandler.js  # centralized error formatter
├── sql/
│   ├── schema.sql       # full DDL (tables, FKs, indexes, FULLTEXT)
│   └── seed.sql         # sample data
├── utils/
│   ├── migrate.js       # runs schema.sql
│   └── seed.js          # runs seed.sql with bcrypt-hashed passwords
└── tests/               # Jest + supertest examples
```

**Folder purpose recap**

- `controllers/` — translate HTTP requests into model calls; never write SQL here.
- `routes/` — declare URL surface, attach auth/validation middleware.
- `models/` — own all SQL; expose plain async functions.
- `middleware/` — cross-cutting concerns (auth, validation, errors).
- `config/` — environment-driven setup (DB pool, etc.).

---

## 3. Database Design

Fully normalized 3NF schema (see `sql/schema.sql`):

- **users** — Admin / Librarian / Member (ENUM role)
- **categories**
- **authors**
- **books** — logical title (1 → N copies)
- **book_authors** — **many-to-many** books ↔ authors
- **book_copies** — physical copies with `status` ENUM
- **transactions** — issue/return ledger
- **reservations** — queue when no copy available
- **fines** — generated on overdue return
- **audit_logs** — optional action trail

**Relationships**

- `books.category_id → categories.id` (N:1)
- `book_authors` (M:N: books ↔ authors)
- `book_copies.book_id → books.id` (1:N)
- `transactions.user_id → users.id`, `transactions.copy_id → book_copies.id`
- `reservations.user_id`, `reservations.book_id`
- `fines.transaction_id → transactions.id`

**Indexes** for performance: `users.role`, `books.title`, `FULLTEXT(title, description)`, `book_copies(book_id, status)`, `transactions(user_id, status)`, `transactions(copy_id, status)`, `reservations(book_id, status)`, `fines(user_id, paid)`. Unique constraints on `users.email`, `books.isbn`, `book_copies.barcode`, and active reservation `(user_id, book_id, status)`.

---

## 4. Setup & Run (step-by-step)

```bash
# 1. Install deps
npm install

# 2. Configure environment
cp .env.example .env       # then edit DB credentials & JWT_SECRET

# 3. Create schema (database + tables)
npm run migrate

# 4. Insert sample data
npm run seed
#    Seeded logins (password = Password123!):
#      admin@lib.com      (admin)
#      librarian@lib.com  (librarian)
#      alice@lib.com      (member)

# 5. Start server
npm run dev          # nodemon (development)
# or
npm start            # production
```

Server runs at `http://localhost:5000` — health check at `GET /health`.

---

## 5. Security

- **bcrypt** password hashing (10 rounds)
- **JWT** auth (`Authorization: Bearer <token>`)
- **Role-based authorization** middleware (`authorize('admin','librarian')`)
- **Joi** input validation on every mutating endpoint
- **Parameterized SQL** everywhere → SQL-injection safe
- **helmet**, **CORS**, **rate-limit** on `/api/auth`
- Centralized error handler — never leaks stack traces in production

---

## 6. Business Logic

Configurable via `.env`:

| Rule | Default |
|---|---|
| `MAX_BOOKS_PER_MEMBER` | 5 active loans |
| `LOAN_PERIOD_DAYS`     | 14 days |
| `FINE_PER_DAY`         | 1.00 currency unit per overdue day |

Implemented in `models/transaction.model.js`:

- ✅ Enforce loan limit
- ✅ Prevent duplicate issue of the same title
- ✅ Lock available copy with `SELECT ... FOR UPDATE` to avoid race conditions
- ✅ Reject when no copies available
- ✅ Compute fine as `max(0, ceil((now - due_at)/day)) * FINE_PER_DAY`
- ✅ Reservation only allowed when 0 copies available; unique active reservation per (user, book)

---

## 7. REST API Reference

> All authenticated endpoints expect `Authorization: Bearer <jwt>`.

### Auth
| Method | Path | Role | Body |
|---|---|---|---|
| POST | `/api/auth/register` | public | `{name,email,password,phone?}` |
| POST | `/api/auth/login`    | public | `{email,password}` |
| GET  | `/api/auth/me`       | any auth | — |

### Users (`/api/users`)
| Method | Path | Role |
|---|---|---|
| GET    | `/`         | admin, librarian |
| POST   | `/`         | admin (create staff) |
| GET    | `/:id`      | admin, librarian |
| PUT    | `/:id`      | admin |
| DELETE | `/:id`      | admin |

### Books (`/api/books`)
| Method | Path | Role |
|---|---|---|
| GET    | `/?q=&category_id=&author_id=&page=&limit=` | public |
| GET    | `/:id` | public |
| POST   | `/`           | admin, librarian |
| PUT    | `/:id`        | admin, librarian |
| DELETE | `/:id`        | admin |
| POST   | `/:id/copies` | admin, librarian |

### Authors (`/api/authors`) and Categories (`/api/categories`)
GET public; POST/PUT staff; DELETE admin.

### Transactions (`/api/transactions`)
| Method | Path | Role |
|---|---|---|
| POST | `/issue`         | admin, librarian — body: `{user_id, book_id}` |
| POST | `/:id/return`    | admin, librarian |
| GET  | `/me`            | any auth |
| GET  | `/user/:userId`  | admin, librarian |

### Reservations (`/api/reservations`)
| Method | Path | Role |
|---|---|---|
| POST   | `/`     | any auth — body: `{book_id}` |
| GET    | `/me`   | any auth |
| DELETE | `/:id`  | any auth |

### Fines (`/api/fines`)
| Method | Path | Role |
|---|---|---|
| GET  | `/me`            | any auth |
| GET  | `/user/:userId`  | admin, librarian |
| POST | `/:id/pay`       | admin, librarian |

### Dashboard
| Method | Path | Role |
|---|---|---|
| GET | `/api/dashboard/stats` | admin, librarian |

---

## 8. Sample Requests / Responses

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "admin@lib.com", "password": "Password123!" }
```
```json
{
  "user": { "id": 1, "name": "Admin User", "email": "admin@lib.com", "role": "admin" },
  "token": "eyJhbGciOiJI..."
}
```

**Search books**
```http
GET /api/books?q=clean&page=1&limit=10
```
```json
{
  "page": 1, "limit": 10, "total": 1,
  "rows": [{ "id": 1, "title": "Clean Code", "isbn": "9780132350884",
             "category": "Technology", "available": 2 }]
}
```

**Issue a book**
```http
POST /api/transactions/issue
Authorization: Bearer <librarian_token>

{ "user_id": 3, "book_id": 1 }
```
```json
{ "transaction_id": 7, "copy_id": 1, "due_at": "2026-05-20T12:00:00.000Z" }
```

**Return a book**
```http
POST /api/transactions/7/return
```
```json
{ "returned_at": "2026-05-22T10:00:00.000Z", "overdue_days": 2, "fine": 2.00 }
```

**Dashboard**
```json
{
  "users": 3, "books": 3, "copies": 5,
  "active_loans": 1, "overdue_loans": 0, "unpaid_fines_total": 0
}
```

---

## 9. Testing

- **Postman**: import the endpoints above; set `{{baseUrl}}=http://localhost:5000` and `{{token}}` after login.
- **Automated**: Jest + supertest sample under `tests/`. Run `npm test`.

Suggested manual test cases:
1. Register → login → call `/auth/me`.
2. Member tries `POST /books` → expect **403**.
3. Librarian issues a book → status `issued` → returns it → fine = 0 if on time.
4. Issue same book twice to same user → expect **400** (duplicate).
5. Issue 6th book to a member (limit 5) → expect **400**.
6. Reserve a book that has copies available → expect **400**.
7. Search `/api/books?q=sapiens` → returns matching row.

---

## 10. Advanced Features Included

- **Pagination** (`?page=&limit=`) on books and users
- **Search & filter** by title/ISBN, category, author
- **Availability tracking** via `book_copies.status` + aggregated `available` count
- **Audit logs** table provided (hook into controllers as needed)
- **Race-safe issuing** using MySQL transactions + `FOR UPDATE`

---

Built to be **scalable, secure, and beginner-friendly**. Extend by adding email notifications, a frontend (React/Next), or background jobs for reservation expiry.
