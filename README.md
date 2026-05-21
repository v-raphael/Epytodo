# Epytodo

A full-stack To-Do application built with **Node.js**, **TypeScript**, **Express**, and **MySQL**.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript 5 |
| Framework | Express 4 |
| Database | MySQL (mysql2) |
| Auth | JWT (HS256) + bcrypt |
| Frontend | Vanilla HTML/CSS/JS |
| Web proxy | Express (port 5000) |

---

## Project Structure

```
Epytodo/
├── src/
│   ├── index.ts                  # Entry point
│   ├── config/
│   │   └── db.ts                 # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.ts               # JWT verification middleware
│   │   └── notFound.ts           # 404 handler
│   └── routes/
│       ├── auth/
│       │   └── auth.ts           # POST /login, POST /register
│       ├── todos/
│       │   ├── todos.ts          # /todos routes
│       │   └── todos.query.ts    # SQL queries
│       └── user/
│           ├── user.ts           # /user, /users routes
│           └── user.query.ts     # SQL queries
├── web/
│   ├── index.html                # Home page
│   ├── auth/                     # Login / Register / Logout pages
│   ├── todos/                    # Todo management page
│   ├── assets/                   # CSS, JS, images
│   └── back-end/
│       └── server.js             # Proxy server (port 5000 → 3000)
├── epytodo.sql                   # Database schema
├── .env.example                  # Environment variables template
├── package.json
└── tsconfig.json
```

---

## Setup

### 1. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
MYSQL_DATABASE=epytodo
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_ROOT_PASSWORD=your_password
PORT=3000
SECRET=your_jwt_secret
```

### 2. Database

Import the SQL schema into MySQL:

```bash
mysql -u root -p < epytodo.sql
```

This creates the `epytodo` database with the `user` and `todo` tables.

### 3. Install dependencies

**API (root):**
```bash
npm install
```

**Web proxy:**
```bash
cd web/back-end
npm install
```

### 4. Run

**API server** (port 3000):
```bash
npm start
```

**Web proxy** (port 5000, optional — needed for the frontend):
```bash
node web/back-end/server.js
```

---

## API Reference

All protected routes require a JWT token via:
- `Authorization: Bearer <token>` header
- `token` field in the request body
- `token` query parameter

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | No | Create an account, returns a JWT |
| `POST` | `/login` | No | Log in, returns a JWT |

**POST /register**
```json
{
  "email": "john@example.com",
  "password": "secret",
  "name": "Doe",
  "firstname": "John"
}
```

**POST /login**
```json
{
  "email": "john@example.com",
  "password": "secret"
}
```

Both return `{ "token": "<jwt>" }` on success.

---

### User

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/user` | Yes | Get the authenticated user's info |
| `GET` | `/user/todos` | Yes | Get the authenticated user's todos |
| `GET` | `/users/:id` | Yes | Get a user by ID or email |
| `PUT` | `/users/:id` | Yes | Update a user |
| `DELETE` | `/users/:id` | Yes | Delete a user |

`GET /users/:id` accepts either a numeric ID or an email address as `:id`.

---

### Todos

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/todos` | Yes | Get all todos |
| `GET` | `/todos/:id` | Yes | Get a todo by ID |
| `POST` | `/todos` | Yes | Create a todo |
| `PUT` | `/todos/:id` | Yes | Update a todo |
| `DELETE` | `/todos/:id` | Yes | Delete a todo |

**POST /todos body:**
```json
{
  "title": "My task",
  "description": "Details here",
  "due_time": "2026-06-01 12:00:00",
  "status": "not started"
}
```

**Todo status values:** `not started` | `todo` | `in progress` | `done`

---

## Database Schema

```sql
CREATE TABLE `user` (
    `id`         INT NOT NULL AUTO_INCREMENT,
    `email`      VARCHAR(255) NOT NULL UNIQUE,
    `password`   VARCHAR(255) NOT NULL,
    `name`       VARCHAR(255) NOT NULL,
    `firstname`  VARCHAR(255) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

CREATE TABLE `todo` (
    `id`          INT NOT NULL AUTO_INCREMENT,
    `title`       VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
    `due_time`    DATETIME NOT NULL,
    `status`      ENUM('not started', 'todo', 'in progress', 'done') DEFAULT 'not started',
    `user_id`     INT NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
```

---

## Common Responses

| Status | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad parameter |
| `401` | Unauthorized / invalid token |
| `404` | Not found |
| `409` | Conflict (e.g. email already exists) |
| `500` | Internal server error |
