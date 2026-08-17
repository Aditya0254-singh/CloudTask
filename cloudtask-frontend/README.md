# CloudTask — Frontend (Phase 4: React Frontend)

A clean, functional React frontend for CloudTask, consuming the existing
CloudTask backend API (Node.js/Express/PostgreSQL from Phases 2–3).

## Overview

Users can register, log in, and manage their own tasks — create, view,
search, filter, edit, change status, and delete — all scoped to their
authenticated account. The frontend is a single-page app; it does not
duplicate any business logic already enforced by the backend (ownership,
validation) — it just presents it.

## Technologies

- React 19 + TypeScript
- Vite (dev server + build)
- Tailwind CSS v4
- react-router-dom
- @tanstack/react-query (server state, caching, mutations)
- Native `fetch` via a small typed API client — no Axios

## Folder structure

```
src/
├── api/
│   └── client.ts            # typed fetch wrapper (auth header, JSON, errors)
├── components/
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   ├── TaskCard.tsx
│   ├── TaskForm.tsx
│   ├── Modal.tsx             # small modal wrapper used by create/edit forms
│   └── LoadingSpinner.tsx
├── context/
│   └── AuthContext.tsx       # JWT + user state, sessionStorage persistence
├── features/
│   ├── auth/
│   │   └── authApi.ts        # register/login API calls
│   └── tasks/
│       ├── tasksApi.ts       # task CRUD API calls
│       └── useTasks.ts       # React Query hooks (useQuery/useMutation)
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   └── NotFoundPage.tsx
├── types/
│   └── index.ts              # User, Task, ApiResponse, filters, requests
├── App.tsx                   # routes
├── main.tsx                  # providers: QueryClient, BrowserRouter, Auth
└── index.css                 # Tailwind import
```

`Modal.tsx` was added beyond the originally listed structure — it's the
one genuinely necessary addition (shared by the create and edit task
forms) rather than duplicating modal markup in two places.

## Backend dependency

This app expects the CloudTask backend (Phases 2–3) running and reachable.
It does not run standalone — every page except the 404 page needs the API.

## Environment setup

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, e.g. `http://localhost:4000/api` |

The URL is never hardcoded elsewhere — every API call goes through
`src/api/client.ts`, which reads this one env var.

## Installation

```bash
npm install
```

## Development

Start the backend first (see the backend README), then:

```bash
npm run dev
```

Vite serves the app at `http://localhost:5173`.

## Production build

```bash
npm run build   # tsc -b && vite build
npm run preview
```

## Main features

- Register / log in / log out
- Session persists across page reloads (JWT + user cached in
  `sessionStorage`, restored on load)
- Protected `/dashboard` route — unauthenticated users are redirected to
  `/login`; authenticated users are redirected away from `/login` and
  `/register`
- Create, edit, delete tasks
- Change task status from a dropdown on each card
- Search tasks by title/description and filter by status/priority — all
  three are sent to the backend as query parameters (`GET /tasks?status=&priority=&search=`),
  never filtered client-side, so this stays compatible with a future
  OpenSearch-backed search endpoint
- Loading, empty, and error states on the task list
- Mutation errors (create/edit/delete/status change) are surfaced to the
  user, not swallowed

## How authentication works

`AuthContext` (in `src/context/AuthContext.tsx`) is the single source of
truth for auth state:

- `login()` and `register()` both call the backend, then store the
  returned `token` and `user` in React state **and** `sessionStorage`
  (key `cloudtask_token` / `cloudtask_user`).
- On mount, a `useEffect` reads `sessionStorage` once to restore the
  session — this is what makes a page refresh keep you logged in without
  a network request.
- `apiClient` reads the token from `sessionStorage` directly (not from
  context) on every request, so it stays framework-agnostic and always
  uses the current token.
- `logout()` clears both React state and `sessionStorage`, then the
  caller navigates to `/login`.
- Registration logs the user in immediately, since the backend already
  returns a token on `POST /auth/register` — there's no second
  authentication path.
- No refresh tokens: a token simply expires (per the backend's
  `JWT_EXPIRES_IN`), and the next request that gets a `401` surfaces as a
  normal API error (e.g. "Failed to load tasks.") rather than a silent
  failure.

## How React Query is used

- `useTasks(filters)` wraps `useQuery`. The query key is
  `["tasks", filters]`, so different filter combinations are cached
  independently, and identical filter sets share a cache entry.
- Four mutation hooks — `useCreateTask`, `useUpdateTask`,
  `useChangeTaskStatus`, `useDeleteTask` — each wrap `useMutation` and, on
  success, call `queryClient.invalidateQueries({ queryKey: ["tasks"] })`.
  Invalidating the `"tasks"` prefix (rather than one exact key) refetches
  every active task list regardless of its current filters — simple and
  predictable, no manual cache surgery or optimistic updates.
- Mutation-level `onError` callbacks surface backend error messages
  (e.g. "Task not found") directly in the UI.
