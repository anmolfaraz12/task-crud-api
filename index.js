const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const Database = require('better-sqlite3');
const app = express();

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.get('/', (req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: "OK"
    });
});

// Database Setup
const db = new Database('tasks.db');

// Create the tasks table if it doesn't already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

// Seed 3 example tasks — only if the table is empty
const countRow = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();
if (countRow.count === 0) {
  const insertSeed = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insertSeed.run('Buy milk', 0);
  insertSeed.run('Learn Express', 0);
  insertSeed.run('Build API', 0);
}

// GET /tasks - Fetch all tasks from DB
app.get('/tasks', (req, res) => {
  const result = db.prepare('SELECT * FROM tasks').all();
  res.json(result);
});

// GET /stats - Compute stats using SQL
app.get('/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count;
  const done = db.prepare('SELECT COUNT(*) AS count FROM tasks WHERE done = 1').get().count;
  const open = total - done;
  res.json({ total, done, open });
});

// GET /tasks/:id - Fetch single task by ID from DB
app.get('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  res.json(task);
});

// POST /tasks - Create a new task in DB
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  const result = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)').run(title, 0);
  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json(newTask);
});

// PUT /tasks/:id - Update task in DB
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, done } = req.body;

  const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existingTask) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: "Provide title or done to update" });
  }

  const newTitle = title !== undefined ? title : existingTask.title;
  let newDone = existingTask.done;
  if (done !== undefined) {
    newDone = done ? 1 : 0;
  }

  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(newTitle, newDone, id);
  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  res.json(updatedTask);
});

// DELETE /tasks/:id - Delete task from DB
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existingTask) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.status(204).send();
});

// POST /reset - Reset database to default tasks
app.post('/reset', (req, res) => {
  db.prepare('DELETE FROM tasks').run();
  db.prepare('DELETE FROM sqlite_sequence WHERE name="tasks"').run();

  const insertSeed = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insertSeed.run('Buy milk', 0);
  insertSeed.run('Learn Express', 0);
  insertSeed.run('Build API', 0);

  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.json({ message: "Tasks reset to default", tasks });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});