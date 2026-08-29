import { listTasks } from "@/lib/tasks-store";
import TaskBoard from "@/components/task-board";

export const dynamic = "force-dynamic";

export default function Home() {
  const initialTasks = listTasks();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Cloud Agent Environment
        </span>
        <h1 className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          my-setup Task Board
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-slate-400">
          A minimal Next.js app used to prove the development environment works end to end.
          Adding a task sends a request to a route handler that persists it server-side and
          streams the updated list back to the browser.
        </p>
      </header>

      <TaskBoard initialTasks={initialTasks} />

      <footer className="mt-auto text-xs text-slate-500">
        Next.js {process.env.NODE_ENV === "production" ? "production build" : "dev server"} ·
        API at <code className="text-slate-400">/api/tasks</code>
      </footer>
    </main>
  );
}
