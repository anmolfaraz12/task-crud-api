const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const Database = require('better-sqlite3');
const app = express();

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.get('/',(req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    });
});

app.get('/health' , (req, res) => {
    res.json({
        status: "OK"
    });
});

let tasks = [
    { id: 1, title: "Buy milk", done: false },
    { id: 2, title: "Learn Express", done: false },
    { id: 3, title: "Build API", done: false }
  ];

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

app.get('/tasks', (req, res) => {
  const result = db.prepare('SELECT * FROM tasks').all();
  res.json(result);
});

app.get('/stats', (req, res) => {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const open = total - done;
  res.json({ total, done, open });
});

app.get('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  res.json(task);
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  const result = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)').run(title, 0);
  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  const { title, done } = req.body;
  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: "Provide title or done to update" });
  }

  if (title !== undefined) task.title = title;
  if (done !== undefined) task.done = done;

  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

app.post('/reset', (req, res) => {
  tasks = [
    { id: 1, title: "Buy milk", done: false },
    { id: 2, title: "Learn Express", done: false },
    { id: 3, title: "Build API", done: false }
  ];
  res.json({ message: "Tasks reset to default", tasks });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});