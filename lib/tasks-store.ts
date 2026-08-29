export type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
};

// In-memory store for the demo. Persists for the lifetime of the server
// process, which is enough to exercise the full browser -> API -> data flow.
declare global {
  var __TASKS__: Task[] | undefined;
}

const seed = (): Task[] => [
  { id: "seed-1", title: "Clone the repository", done: true, createdAt: Date.now() - 3000 },
  { id: "seed-2", title: "Run npm ci to install dependencies", done: true, createdAt: Date.now() - 2000 },
  { id: "seed-3", title: "Start the dev server and open the app", done: false, createdAt: Date.now() - 1000 },
];

function getStore(): Task[] {
  if (!globalThis.__TASKS__) {
    globalThis.__TASKS__ = seed();
  }
  return globalThis.__TASKS__;
}

export function listTasks(): Task[] {
  return [...getStore()].sort((a, b) => a.createdAt - b.createdAt);
}

export function addTask(title: string): Task {
  const task: Task = {
    id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    done: false,
    createdAt: Date.now(),
  };
  getStore().push(task);
  return task;
}

export function toggleTask(id: string): Task | undefined {
  const task = getStore().find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
  }
  return task;
}

export function deleteTask(id: string): boolean {
  const store = getStore();
  const index = store.findIndex((t) => t.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}
