import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from '../hooks/use-toast';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

const API_URL = import.meta.env.DEV ? 'http://localhost:4000' : ''; // in prod same origin

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const fetchTasks = async () => {
    const res = await fetch(`${API_URL}/tasks`);
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!newTitle.trim()) {
      toast({ title: 'Erro', description: 'O título não pode ser vazio.', variant: 'destructive' });
      return;
    }
    if (newTitle.length > 100) {
      toast({ title: 'Erro', description: 'Título muito longo (máx 100).', variant: 'destructive' });
      return;
    }
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      setNewTitle('');
      fetchTasks();
      toast({ title: 'Sucesso', description: 'Tarefa criada.' });
    } else {
      const err = await res.json();
      toast({ title: 'Erro', description: err.error ?? 'Falha ao criar.', variant: 'destructive' });
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm('Excluir tarefa?')) return;
    const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchTasks();
      toast({ title: 'Sucesso', description: 'Tarefa excluída.' });
    }
  };

  const toggleComplete = async (task: Task) => {
    const res = await fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    });
    if (res.ok) fetchTasks();
  };

  const editTask = async (task: Task) => {
    const newTitle = prompt('Editar título', task.title);
    if (newTitle === null) return;
    if (!newTitle.trim()) {
      toast({ title: 'Erro', description: 'Título vazio.', variant: 'destructive' });
      return;
    }
    if (newTitle.length > 100) {
      toast({ title: 'Erro', description: 'Título muito longo.', variant: 'destructive' });
      return;
    }
    const res = await fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    if (res.ok) {
      fetchTasks();
      toast({ title: 'Sucesso', description: 'Título atualizado.' });
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = total - completedCount;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-[#3B82F6]">Task Manager</h1>
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Nova tarefa"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <Button onClick={addTask}>Adicionar</Button>
      </div>
      <div className="flex space-x-2 mb-4">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
          Todas ({total})
        </Button>
        <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>
          Pendentes ({pendingCount})
        </Button>
        <Button variant={filter === 'completed' ? 'default' : 'outline'} onClick={() => setFilter('completed')}>
          Concluídas ({completedCount})
        </Button>
      </div>
      <div className="grid gap-4">
        {filtered.map((task) => (
          <Card key={task.id} className="flex items-center p-4">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleComplete(task)}
              className="mr-4"
            />
            <div className="flex-1">
              <p className={`text-lg ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</p>
              <p className="text-sm text-gray-400">{new Date(task.createdAt).toLocaleString()}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => editTask(task)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6v14"/><path d="M16 6v14"/><path d="M5 6l1-3h12l1 3"/></svg>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Tasks;
