"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const STORAGE_KEY = "simple_tasks";

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");

  // Load tasks on mount
  useEffect(() => {
    setTasks(loadTasks().sort((a, b) => b.id.localeCompare(a.id)));
  }, []);

  // Persist changes
  const persist = useCallback((updated: Task[]) => {
    setTasks(updated);
    saveTasks(updated);
  }, []);

  const addTask = () => {
    const title = newTitle.trim();
    if (!title) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };
    persist([newTask, ...tasks]);
    setNewTitle("");
  };

  const editTask = (task: Task) => {
    const edited = prompt("Editar tarefa", task.title);
    if (edited !== null && edited.trim() !== "") {
      const updated = tasks.map((t) =>
        t.id === task.id ? { ...t, title: edited.trim() } : t,
      );
      persist(updated);
    }
  };

  const deleteTask = (id: string) => {
    if (confirm("Excluir esta tarefa?")) {
      const updated = tasks.filter((t) => t.id !== id);
      persist(updated);
    }
  };

  const toggleComplete = (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    persist(updated);
  };

  const total = tasks.length;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-600">
          Gerenciador de Tarefas
        </h1>

        {/* Input area */}
        <div className="flex gap-2">
          <Input
            placeholder="Nova tarefa"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Button onClick={addTask}>Adicionar</Button>
        </div>

        {/* Counter */}
        <Badge variant="secondary" className="w-full text-center">
          Total de tarefas: {total}
        </Badge>

        {/* Task list */}
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleComplete(task.id)}
                />
                <span
                  className={
                    task.completed ? "line-through text-gray-500" : ""
                  }
                >
                  {task.title}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editTask(task)}
                  aria-label="Editar tarefa"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5h2m-1 8v6m-4-6h8"
                    />
                  </svg>
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteTask(task.id)}
                  aria-label="Excluir tarefa"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}