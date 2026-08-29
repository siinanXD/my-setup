"use client";

import { useState, useTransition } from "react";
import type { Task } from "@/lib/tasks-store";

export default function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    const res = await fetch("/api/tasks", { cache: "no-store" });
    const data = await res.json();
    setTasks(data.tasks as Task[]);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Please enter a task title.");
      return;
    }

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setTitle("");
    startTransition(refresh);
  }

  async function handleToggle(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "PATCH" });
    startTransition(refresh);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    startTransition(refresh);
  }

  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur">
      <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task…"
          aria-label="Task title"
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/30"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add task
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {tasks.length === 0 && (
          <li className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
            No tasks yet. Add your first one above.
          </li>
        )}
        {tasks.map((task) => (
          <li
            key={task.id}
            className="group flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3 transition hover:border-white/15"
          >
            <button
              onClick={() => handleToggle(task.id)}
              aria-label={task.done ? "Mark as not done" : "Mark as done"}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                task.done
                  ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                  : "border-white/20 text-transparent hover:border-indigo-400"
              }`}
            >
              ✓
            </button>
            <span
              className={`flex-1 text-sm ${
                task.done ? "text-slate-500 line-through" : "text-slate-100"
              }`}
            >
              {task.title}
            </span>
            <button
              onClick={() => handleDelete(task.id)}
              aria-label="Delete task"
              className="text-xs text-slate-500 opacity-0 transition hover:text-red-300 group-hover:opacity-100"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-400">
        <span>
          {remaining} of {tasks.length} remaining
        </span>
        <span className="rounded-full bg-white/5 px-2 py-1">served from /api/tasks</span>
      </div>
    </section>
  );
}
