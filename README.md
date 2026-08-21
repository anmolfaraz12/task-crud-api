# Task API

A database-backed CRUD API for managing a to-do list, built with Node.js, Express, and SQLite (`better-sqlite3`). Includes interactive Swagger UI documentation.
Built as part of the **FlyRank Internship — Backend Track, Week 3, Assignment A2**.

## Features

* Full CRUD operations (Create, Read, Update, Delete) backed by a persistent SQLite database (`tasks.db`).
* Safe database operations using parameterized queries (SQL injection prevention).
* Input validation with proper HTTP status codes (`200`, `201`, `204`, `400`, `404`).
* Interactive API documentation via Swagger UI.
* Useful endpoints for health, stats, and database reset.

## Tech Stack

* **Node.js**
* **Express**
* **better-sqlite3** (SQLite Database)
* **swagger-ui-express**

## How to Install & Run

1. **Install Dependencies:**
```bash
npm install

```


2. **Run the Server:**
```bash
node index.js

```



Server will start on `http://localhost:3000`. The SQLite database file (`tasks.db`) will be created automatically on the first run with seeded example tasks.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| **GET** | `/` | API info |
| **GET** | `/health` | Health check |
| **GET** | `/tasks` | Get all tasks (fetched from SQLite DB) |
| **GET** | `/tasks/:id` | Get a single task by ID |
| **POST** | `/tasks` | Create a new task |
| **PUT** | `/tasks/:id` | Update a task title or status |
| **DELETE** | `/tasks/:id` | Delete a task |
| **GET** | `/stats` | Get task statistics (total, done, open via SQL count) |
| **POST** | `/reset` | Reset DB to 3 default tasks |

## API Documentation (Swagger UI)

Once the server is running, visit:

`http://localhost:3000/docs`

## Example Request & Response

```bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\":\"Buy milk\"}"

```

**Response:**

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":4,"title":"Buy milk","done":0}

```

## Why SQLite & Persistence Proof

In Week 2, the API used in-memory arrays, so restarting the server deleted all created tasks. In Week 3, storage was migrated to a **SQLite** database (`tasks.db`).

* **Why SQLite:** It is a lightweight, serverless, single-file database requiring zero additional database setup while providing full relational database capabilities.
* **Persistence:** Tasks now survive server restarts because data is written directly to disk (`tasks.db`) rather than kept in RAM memory.

### Database Exploration

Data verified through direct SQL execution:

```sql
SELECT * FROM tasks;

```