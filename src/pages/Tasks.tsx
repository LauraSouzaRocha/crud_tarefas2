"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTasks, Task } from "@/hooks/useTasks";

export default function Tasks() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    totals,
  } = useTasks();

  const [newTitle, setNewTitle] = useState("");

  const handleAdd = () => {
    if (!newTitle.trim()) {
      toast.error("O título não pode ser vazio");
      return;
    }
    addTask(newTitle.trim());
    setNewTitle("");
    toast.success("Tarefa criada");
  };

  const handleEdit = (task: Task) => {
    const newT = prompt("Editar título", task.title);
    if (newT !== null && newT.trim() !== "") {
      updateTask({ ...task, title: newT.trim() });
      toast.success("Tarefa atualizada");
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      deleteTask(id);
      toast.success("Tarefa excluída");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-[#3B82F6]">
        Gerenciador de Tarefas
      </h1>

      {/* Input area */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Nova tarefa"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <Button onClick={handleAdd}>Adicionar</Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4">
        <Badge variant="secondary">Total: {totals.total}</Badge>
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Concluídas: {totals.completed}
        </Badge>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          Pendentes: {totals.pending}
        </Badge>
      </div>

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
                className={task.completed ? "line-through text-gray-500" : ""}
              >
                {task.title}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(task)}
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
                onClick={() => handleDelete(task.id)}
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
  );
}