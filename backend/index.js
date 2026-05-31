const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite DB
const dbPath = path.resolve(__dirname, 'tasks.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite DB:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite DB');
});

// Create tasks table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK(length(title) <= 100),
    completed INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL
  )
`);

// Helper to format rows
function rowToTask(row) {
  return {
    id: row.id,
    title: row.title,
    completed: !!row.completed,
    createdAt: row.createdAt,
  };
}

// GET /tasks - list all tasks ordered newest first
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY datetime(createdAt) DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(rowToTask));
  });
});

// POST /tasks - create a new task
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Título não pode ser vazio.' });
  }
  if (title.length > 100) {
    return res.status(400).json({ error: 'Título deve ter no máximo 100 caracteres.' });
  }
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO tasks (title, completed, createdAt) VALUES (?, ?, ?)',
    [title.trim(), 0, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, title: title.trim(), completed: false, createdAt });
    }
  );
});

// PUT /tasks/:id - update title or completed status
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  if (title !== undefined) {
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Título não pode ser vazio.' });
    }
    if (title.length > 100) {
      return res.status(400).json({ error: 'Título deve ter no máximo 100 caracteres.' });
    }
    db.run('UPDATE tasks SET title = ? WHERE id = ?', [title.trim(), id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });
      res.json({ message: 'Título atualizado.' });
    });
    return;
  }
  if (completed !== undefined) {
    const completedInt = completed ? 1 : 0;
    db.run('UPDATE tasks SET completed = ? WHERE id = ?', [completedInt, id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });
      res.json({ message: 'Status atualizado.' });
    });
    return;
  }
  res.status(400).json({ error: 'Nenhum campo para atualizar.' });
});

// DELETE /tasks/:id - delete task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    res.json({ message: 'Tarefa excluída.' });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
