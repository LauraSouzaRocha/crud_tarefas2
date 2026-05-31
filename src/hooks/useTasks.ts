"use client";

import { useState, useEffect, useCallback } from "react";

export type Task = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
};

const STORAGE_KEY = "dyad_tasks";

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

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setTasks(loadTasks().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, []);

  // Helper to persist and update state
  const persist = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  }, []);

  const addTask = (title: string) => {
    const newTask: Task = {
      id: Date.now(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    persist([newTask, ...tasks]);
  };

  const updateTask = (updated: Task) => {
    const newTasks = tasks.map((t) => (t.id === updated.id ? updated : t));
    persist(newTasks);
  };

  const deleteTask = (id: number) => {
    const newTasks = tasks.filter((t) => t.id !== id);
    persist(newTasks);
  };

  const toggleComplete = (id: number) => {
    const newTasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    persist(newTasks);
  };

  const totals = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.length - tasks.filter((t) => t.completed).length,
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    totals,
  };
}