import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(cors());
app.use(express.json());

// Open SQLite DB
async function initDb() {
  const db = await open({
    filename: './backend/tasks.db',
    driver: sqlite3.Database,
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);
  return db;
}

let DB;
initDb().then((db) => {
  DB = db;
  console.log('SQLite DB initialized');
});

// Validation middleware
function validateTask(req, res, next) {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Título da tarefa é obrigatório.' });
  }
  if (title.length > 100) {
    return res.status(400).json({ error: 'Título deve ter no máximo 100 caracteres.' });
  }
  next();
}

// GET /tasks - list newest first
app.get('/tasks', async (req, res) => {
  try {
    const rows = await DB.all('SELECT * FROM tasks ORDER BY createdAt DESC');
    const tasks = rows.map((r) => ({
      id: r.id,
      title: r.title,
      completed: !!r.completed,
      createdAt: r.createdAt,
    }));
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

// POST /tasks - create
app.post('/tasks', validateTask, async (req, res) => {
  const { title } = req.body;
  const createdAt = new Date().toISOString();
  try {
    const result = await DB.run(
      'INSERT INTO tasks (title, completed, createdAt) VALUES (?, ?, ?)',
      title,
      0,
      createdAt
    );
    const task = { id: result.lastID, title, completed: false, createdAt };
    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

// PUT /tasks/:id - update (title or completed)
app.put('/tasks/:id', validateTask, async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  try {
    const result = await DB.run(
      'UPDATE tasks SET title = ?, completed = ? WHERE id = ?',
      title,
      completed ? 1 : 0,
      id
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    const updated = await DB.get('SELECT * FROM tasks WHERE id = ?', id);
    res.json({
      id: updated.id,
      title: updated.title,
      completed: !!updated.completed,
      createdAt: updated.createdAt,
    });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

// DELETE /tasks/:id
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await DB.run('DELETE FROM tasks WHERE id = ?', id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao excluir tarefa' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
