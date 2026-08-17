const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
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
  
  app.get('/tasks', (req, res) => {
    res.json(tasks);
  });
  
  app.get('/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
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
  
    const newTask = {
      id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      title,
      done: false
    };
  
    tasks.push(newTask);
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
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
