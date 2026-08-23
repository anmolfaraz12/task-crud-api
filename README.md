# Task API

A CRUD API for managing a to-do list, built with Node.js and Express.
Data is stored in a SQLite database (`tasks.db`) so it survives server restarts.

*This project started as an in-memory CRUD API and was later migrated to use a
SQLite database for persistent storage.*

## How to run

```bash
npm install
node index.js
```

Server runs on http://localhost:3000
Swagger docs at http://localhost:3000/docs

The database file (`tasks.db`) and its `tasks` table are created automatically the
first time you run the app, along with 3 seeded example tasks (only if the table is empty).

## Endpoints

| Method | Path         | Description                          |
|--------|--------------|---------------------------------------|
| GET    | /            | API info                              |
| GET    | /health      | Health check                          |
| GET    | /tasks       | List all tasks                        |
| GET    | /tasks/:id   | Get one task                          |
| POST   | /tasks       | Create a task                         |
| PUT    | /tasks/:id   | Update a task                         |
| DELETE | /tasks/:id   | Delete a task                         |
| GET    | /stats       | Task counts (total, done, open)       |
| POST   | /reset       | Reset database to 3 default tasks     |

## Example request

```bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'
```

Response:
```json
{"id":4,"title":"Buy milk","done":0}
```

## Swagger screenshot

![Swagger UI](./swagger-screenshot.png)

---

## Database

### Why SQLite?
SQLite was chosen because it needs no separate server or installation — the whole
database is just one file (`tasks.db`). This makes it perfect for a small project like
this: zero setup, and unlike storing data in memory, the data survives a server restart.

### Where the database lives
The database file is `tasks.db`, created automatically in the project folder the first
time the app runs, using `CREATE TABLE IF NOT EXISTS`. Three example tasks are seeded
only when the table is empty, so restarting the server never duplicates them.

### Proof of persistence
Tasks created through `POST /tasks` are written directly to `tasks.db` using SQL
`INSERT` statements. Stopping and restarting the server does not clear them — unlike
the earlier in-memory version, where all data was lost on every restart.

### Database screenshot
![Database view](./db-screenshot.png)

### Example SQL query
```sql
SELECT * FROM tasks;
```
This lists every task currently in the database — confirming that tasks created
through the API (such as "Test persistence") are actually saved to `tasks.db` and
survive a server restart, not just kept in memory.

### Parameterized queries
All queries that use user input (`WHERE id = ?`, `INSERT INTO tasks (title, done)
VALUES (?, ?)`, etc.) use `?` placeholders instead of gluing values directly into the
SQL string. This keeps the database safe from SQL injection.