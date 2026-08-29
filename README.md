# my-setup

A small [Next.js](https://nextjs.org) (App Router) demo app used to validate the Cloud Agent
development environment. It renders a task board whose data flows through a real route handler:
the browser calls `/api/tasks`, the server persists the task in an in-memory store, and the
updated list is streamed back to the UI.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS v4

## Getting started

Install dependencies and start the dev server:

```bash
npm ci        # or: npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command            | Description                            |
| ------------------ | -------------------------------------- |
| `npm run dev`      | Start the development server           |
| `npm run build`    | Create a production build              |
| `npm run start`    | Serve the production build             |
| `npm run lint`     | Run ESLint (`next lint`)               |
| `npm run typecheck`| Type-check with `tsc --noEmit`         |

## API

| Method   | Route             | Description              |
| -------- | ----------------- | ------------------------ |
| `GET`    | `/api/tasks`      | List all tasks           |
| `POST`   | `/api/tasks`      | Create a task            |
| `PATCH`  | `/api/tasks/:id`  | Toggle a task's done flag |
| `DELETE` | `/api/tasks/:id`  | Delete a task            |
