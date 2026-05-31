import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

const api = "http://localhost:4000";

export default function Tasks() {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");

  const { data: tasks = [], isLoading, isError } = useQuery<Task[]>(
    ["tasks"],
    async () => {
      const res = await fetch(`${api}/tasks`);
      if (!res.ok) throw new Error("Erro ao buscar tarefas");
      return res.json();
    }
  );

  const addMutation = useMutation<string, Error, string>(
    async (title) => {
      const res = await fetch(`${api}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar tarefa");
      }
      return res.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        setNewTitle("");
        toast.success("Tarefa criada com sucesso");
      },
      onError: (e) => toast.error(e.message),
    }
  );

  const updateMutation = useMutation<Task, Error, Task>(
    async (task) => {
      const res = await fetch(`${api}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, completed: task.completed }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao atualizar tarefa");
      }
      return res.json();
    },
    {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      onError: (e) => toast.error(e.message),
    }
  );

  const deleteMutation = useMutation<void, Error, number>(
    async (id) => {
      const res = await fetch(`${api}/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao excluir tarefa");
      }
    },
    {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
      onError: (e) => toast.error(e.message),
    }
  );

  const handleAdd = () => {
    if (!newTitle.trim()) return toast.error("Título não pode ser vazio");
    addMutation.mutate(newTitle.trim());
  };

  const toggleComplete = (task: Task) => {
    updateMutation.mutate({ ...task, completed: !task.completed });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (task: Task) => {
    const newT = prompt("Editar título", task.title);
    if (newT !== null && newT.trim() !== "") {
      updateMutation.mutate({ ...task, title: newT.trim() });
    }
  };

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  if (isLoading) return <div className="p-4">Carregando...</div>;
  if (isError) return <div className="p-4 text-red-500">Erro ao carregar tarefas</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-[#3B82F6]">Gerenciador de Tarefas</h1>
      <div className="flex gap-2 mb-4">
        <Input placeholder="Nova tarefa" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <Button onClick={handleAdd} disabled={addMutation.isLoading}>Adicionar</Button>
      </div>
      <div className="flex gap-4 mb-4">
        <Badge variant="secondary">Total: {total}</Badge>
        <Badge variant="outline" className="bg-green-100 text-green-800">Concluídas: {completed}</Badge>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendentes: {pending}</Badge>
      </div>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox checked={task.completed} onCheckedChange={() => toggleComplete(task)} />
              <span className={task.completed ? "line-through text-gray-500" : ""}>{task.title}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1 8v6m-4-6h8" /></svg>
              </Button>
              <Button variant="destructive" size="icon" onClick={() => handleDelete(task.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
