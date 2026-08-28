const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const { pool, initDb } = require('./db');
const supabase = require('./supabaseClient');
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

// ===== Auth routes (A4) =====

// POST /auth/signup - Register a new user via Supabase
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data.user);
});

// POST /auth/login - Authenticate user and return tokens
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: 'Invalid login credentials' });
  }

  res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token
  });
});

// GET /tasks - Fetch all tasks from DB
app.get('/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks');
  res.json(result.rows);
});

// GET /stats - Compute stats using SQL
app.get('/stats', async (req, res) => {
  const totalResult = await pool.query('SELECT COUNT(*) AS count FROM tasks');
  const doneResult = await pool.query('SELECT COUNT(*) AS count FROM tasks WHERE done = true');

  const total = parseInt(totalResult.rows[0].count, 10);
  const done = parseInt(doneResult.rows[0].count, 10);
  const open = total - done;

  res.json({ total, done, open });
});

// GET /tasks/:id - Fetch single task by ID from DB
app.get('/tasks/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
  const task = result.rows[0];

  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  res.json(task);
});

// POST /tasks - Create a new task in DB
app.post('/tasks', async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  const result = await pool.query(
    'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
    [title, false]
  );

  res.status(201).json(result.rows[0]);
});

// PUT /tasks/:id - Update task in DB
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, done } = req.body;

  const existingResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  const existingTask = existingResult.rows[0];

  if (!existingTask) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: "Provide title or done to update" });
  }

  const newTitle = title !== undefined ? title : existingTask.title;
  const newDone = done !== undefined ? Boolean(done) : existingTask.done;

  const updatedResult = await pool.query(
    'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
    [newTitle, newDone, id]
  );

  res.json(updatedResult.rows[0]);
});

// DELETE /tasks/:id - Delete task from DB
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  const existingResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (!existingResult.rows[0]) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  res.status(204).send();
});

// POST /reset - Reset database to default tasks
app.post('/reset', async (req, res) => {
  await pool.query('DELETE FROM tasks');
  await pool.query('ALTER SEQUENCE tasks_id_seq RESTART WITH 1');

  await pool.query(
    `INSERT INTO tasks (title, done) VALUES
      ('Buy milk', false),
      ('Learn Express', false),
      ('Build API', false)`
  );

  const result = await pool.query('SELECT * FROM tasks');
  res.json({ message: "Tasks reset to default", tasks: result.rows });
});
// GET /public/info - No auth needed
app.get('/public/info', (req, res) => {
  res.status(200).json({ message: "Welcome stranger! This info is public." });
});

// GET /protected/profile - Check token presence (verification not yet)
app.get('/protected/profile', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] === '') {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  // Stage 2: sirf check kar rahe hain token bheja gaya hai, verify nahi kar rahe abhi
  res.status(200).json({ message: 'Token received (not verified yet)', tokenPreview: token.substring(0, 20) + '...' });
});
// Database ready hone ke baad hi server start karo
initDb()
  .then(() => {
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
      console.log('Server running and connected to Supabase');
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });