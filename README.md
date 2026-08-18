# Task API

A simple in-memory CRUD API for managing a to-do list, built with Node.js and Express. Includes interactive Swagger UI documentation.

Built as part of the FlyRank Internship — Backend Track, Week 2, Assignment A1.

## Features

- Full CRUD operations (Create, Read, Update, Delete) on tasks
- Input validation with proper HTTP status codes
- Interactive API documentation via Swagger UI
- Bonus endpoints: filtering, search, stats, and reset

## Tech Stack

- Node.js
- Express
- swagger-ui-express

## How to Install & Run

```bash
npm install
node index.js
```

Server will start on `http://localhost:3000`.

## Endpoints

| Method | Path            | Description                          |
|--------|-----------------|---------------------------------------|
| GET    | /               | API info                              |
| GET    | /health         | Health check                          |
| GET    | /tasks          | Get all tasks                         |
| GET    | /tasks/:id      | Get a single task                     |
| POST   | /tasks          | Create a new task                     |
| PUT    | /tasks/:id      | Update a task                         |
| DELETE | /tasks/:id      | Delete a task                         |
| GET    | /tasks?done=true | Filter tasks by completion status    |
| GET    | /tasks?search=milk | Search tasks by title              |
| GET    | /stats          | Get task statistics (total/done/open) |
| POST   | /reset          | Reset tasks to default 3 dummy tasks  |

## API Documentation (Swagger UI)

Once the server is running, visit:

http://localhost:3000/docs

![Swagger UI Screenshot](swagger-screenshot.png)

## Example Request

```bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\":\"Buy milk\"}"
```

Response:
```bash
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":4,"title":"Buy milk","done":false}
```

## The Mortality Experiment

Since this API stores data in-memory (a JavaScript array), all data is lost when the server restarts. During testing, a task added while the server was running disappeared after restarting — only the original 3 hardcoded dummy tasks remained. This happens because in-memory data only exists while the Node.js process is running; there is no database or file persisting it. This is the reason a database will be introduced in Week 3.