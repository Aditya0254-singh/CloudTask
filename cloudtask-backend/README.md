# CloudTask — Backend

CloudTask is a cloud-based task management platform. This repository is the
backend API, built as a modular monolith with Node.js, Express, TypeScript,
and PostgreSQL.

Caching, file uploads, and AWS integration are implemented in later phases.

---

# Phase 2 — Foundation + Auth

Covers project setup, database connectivity, migrations, and user
authentication (register/login/JWT).

## Technologies used in this phase

- Node.js + TypeScript
- Express.js
- PostgreSQL (via the `pg` driver — no ORM)
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- zod (request validation)
- helmet + cors (baseline HTTP security)
- dotenv (environment configuration)

## Project structure

```
src/
├── modules/
│   ├── auth/            # register, login, protected /me route
│   └── tasks/            # task CRUD, ownership-scoped (Phase 3)
├── config/               # env.ts, db.ts
├── middleware/           # auth.middleware.ts, error.middleware.ts
├── db/migrations/        # plain .sql migration files
├── db/migrate.ts         # migration runner
├── app.ts                # Express app + route wiring
└── server.ts             # entrypoint
```

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

`.env` variables:

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `4000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1h` |

## 3. Create the PostgreSQL database

Make sure PostgreSQL is running locally, then create the database:

```bash
createdb cloudtask
# or, from psql:
# CREATE DATABASE cloudtask;
```

## 4. Run migrations

This applies `src/db/migrations/*.sql` in order and tracks what has already
run in a `migrations` table:

```bash
npm run migrate
```

## 5. Start the development server

```bash
npm run dev
```

You should see:

```
Connected to PostgreSQL successfully.
CloudTask API listening on port 4000
```

## API endpoints implemented

| Method | Path | Auth required | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/auth/me` | Yes (Bearer token) | Returns the identity from the JWT |

All responses follow the shape:

```json
{ "success": true, "message": "...", "data": { } }
```

or, on error:

```json
{ "success": false, "message": "..." }
```

## Testing the API

### 1. Health check

```bash
curl http://localhost:4000/api/health
```

### 2. Register

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aditya","email":"aditya@example.com","password":"password123"}'
```

Expect `201` and a `user` + `token` in the response. `password_hash` is
never returned.

### 3. Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aditya@example.com","password":"password123"}'
```

Expect `200` and a `user` + `token`.

### 4. Protected route

Copy the `token` from the login response, then:

```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <paste-token-here>"
```

Expect `200` with your `userId` and `email`.

Without a token:

```bash
curl http://localhost:4000/api/auth/me
```

Expect `401`.

### 5. Duplicate email

Run the register command from step 2 a second time with the same email.
Expect `409` with `"An account with this email already exists"`.

### 6. Invalid password (login)

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aditya@example.com","password":"wrongpassword"}'
```

Expect `401` with `"Invalid email or password"`.

---

# Phase 3 — Task Management API

Adds full CRUD for tasks. Every task is owned by exactly one user, and every
query is scoped by `user_id` so a user can never read, modify, or delete
another user's tasks — even if they know the task's UUID.

## Database schema (tasks)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | auto-generated |
| `user_id` | UUID (FK → `users.id`) | `ON DELETE CASCADE` |
| `title` | VARCHAR(200) | required |
| `description` | TEXT | optional |
| `status` | VARCHAR(20) | `todo` \| `in_progress` \| `done`, default `todo`, enforced by `CHECK` |
| `priority` | VARCHAR(20) | `low` \| `medium` \| `high`, default `medium`, enforced by `CHECK` |
| `created_at` | TIMESTAMP | default `CURRENT_TIMESTAMP` |
| `updated_at` | TIMESTAMP | bumped on every update |

Indexes: `(user_id, status)` and `(user_id, created_at)` — support the two
most common access patterns: filtering by status and listing newest-first.

Run the new migration the same way as before:

```bash
npm run migrate
```

## Task endpoints

All task endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | List the caller's tasks (supports `status`, `priority`, `search` query params) |
| GET | `/api/tasks/:id` | Get one task (must be owned by the caller) |
| PUT | `/api/tasks/:id` | Update a task (any subset of `title`, `description`, `status`, `priority`) |
| PATCH | `/api/tasks/:id/status` | Change only the status |
| DELETE | `/api/tasks/:id` | Delete a task |

`userId` is always taken from the JWT (`req.user.userId`), never from the
request body — a client cannot create or access tasks on another user's
behalf.

### Query parameters for GET /api/tasks

| Param | Example | Behavior |
|---|---|---|
| `status` | `?status=todo` | Exact match |
| `priority` | `?priority=high` | Exact match |
| `search` | `?search=AWS` | `ILIKE` match against `title` OR `description` |

Filters can be combined, e.g. `?status=in_progress&priority=high`.

### Example: create a task

```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Prepare AWS project","description":"Build and deploy CloudTask","priority":"high"}'
```

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "id": "b66a442c-6200-4aa7-99b7-7d97474fa77a",
      "user_id": "ec2dffb3-aa94-4c25-8189-0ef769758a92",
      "title": "Prepare AWS project",
      "description": "Build and deploy CloudTask",
      "status": "todo",
      "priority": "high",
      "created_at": "2026-08-15T11:31:35.870Z",
      "updated_at": "2026-08-15T11:31:35.870Z"
    }
  }
}
```

### Example: change status

```bash
curl -X PATCH http://localhost:4000/api/tasks/<taskId>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status":"done"}'
```

### Example: task not found / not owned (404)

```json
{ "success": false, "message": "Task not found" }
```

The same message is returned whether the task doesn't exist or belongs to
someone else — this deliberately avoids revealing which case it is.

## Testing the Task API

Register two users to test ownership isolation, then run through the
scenarios below.

```bash
# Register User A
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Aditya","email":"userA@example.com","password":"password123"}'

# Register User B
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"userB@example.com","password":"password123"}'
```

Save each `token` from the response, then:

1. **Create a task (User A, valid JWT)** → `201`
2. **Create a task with no `Authorization` header** → `401`
3. **Create a task with `title: ""`** → `400`
4. **`GET /api/tasks` (User A)** → `200`, only User A's tasks
5. **`GET /api/tasks?status=todo`** → `200`, filtered
6. **`GET /api/tasks?priority=high`** → `200`, filtered
7. **`GET /api/tasks?search=AWS`** → `200`, matches title/description
8. **`GET /api/tasks/:id` (User A, own task)** → `200`
9. **`GET /api/tasks/:id` (random valid UUID that doesn't exist)** → `404`
10. **`PUT /api/tasks/:id` (User A, own task)** → `200`, fields updated
11. **`PATCH /api/tasks/:id/status`** → `200`
12. **`DELETE /api/tasks/:id` (User A, own task)** → `204`
13. **`GET /api/tasks/:id` using User B's token on User A's task id** → `404`
14. **`PUT /api/tasks/:id` using User B's token on User A's task id** → `404`
15. **`DELETE /api/tasks/:id` using User B's token on User A's task id** → `404`
16. **`GET /api/tasks/not-a-valid-uuid`** → `400`
17. **`GET /api/tasks` with User B's token** → `200`, empty array (never contains User A's tasks)

All 17 scenarios above were run against a live local instance during
development and passed exactly as described.

---

# Phase 5A — Docker (backend only)

The backend now runs as a production container. PostgreSQL is **not**
containerized — the app container connects to Postgres running on your
host (or wherever `DATABASE_URL` points) via environment variables.

## What the image does

- **Multi-stage build.** Stage 1 (`builder`) installs all dependencies and
  compiles TypeScript (`npm run build`). Stage 2 (`production`) installs
  only production dependencies and copies in the compiled `dist/` — no
  TypeScript, `ts-node`, or other dev tooling ships in the final image.
- Runs `node dist/server.js` — never `ts-node-dev`.
- Listens on `0.0.0.0:4000` inside the container (not just `localhost`),
  so port-mapping (`-p 4000:4000`) actually reaches it from the host.
- Runs as a non-root user (`nodeapp`).
- No secrets are baked into the image. `DATABASE_URL`, `JWT_SECRET`,
  `JWT_EXPIRES_IN`, and `PORT` are all read from environment variables at
  container start — the same `env.ts` from Phase 2, unchanged.
- Includes a container-level `HEALTHCHECK` against `/api/health` using
  Node's built-in `http` module (no extra OS packages needed just for
  that).

## Build the image

From `cloudtask-backend/`:

```bash
docker build -t cloudtask-backend:latest .
```

## Run the container

PostgreSQL is assumed to already be running on your machine (as in
Phases 2–3) with the `cloudtask` database migrated.

On **Windows with Docker Desktop**, a container reaches a service running
on the host via the special DNS name `host.docker.internal` — not
`localhost`, since `localhost` inside the container refers to the
container itself.

```bash
docker run -d \
  --name cloudtask-backend \
  -p 4000:4000 \
  -e PORT=4000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/cloudtask" \
  -e JWT_SECRET="replace-with-a-long-random-string" \
  -e JWT_EXPIRES_IN="1h" \
  cloudtask-backend:latest
```

### Required environment variables

| Variable | Description |
|---|---|
| `PORT` | Port the app listens on inside the container (must match `-p` mapping) |
| `DATABASE_URL` | PostgreSQL connection string — use `host.docker.internal` instead of `localhost` on Docker Desktop |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1h` |

None of these have defaults baked into the image for `DATABASE_URL` or
`JWT_SECRET` — the container will exit immediately with a clear error if
either is missing, exactly like running `node dist/server.js` locally
without a `.env` file.

## Test /api/health

```bash
curl http://localhost:4000/api/health
```

Expected:

```json
{ "success": true, "message": "CloudTask API is running" }
```

Also check the container's own health status:

```bash
docker ps
# STATUS column will show "healthy" once the HEALTHCHECK passes
```

## Stopping / cleaning up

```bash
docker stop cloudtask-backend
docker rm cloudtask-backend
```

## Why no docker-compose yet

A `docker-compose.yml` isn't included in this phase. It isn't necessary:
there's exactly one container to run, `docker run` with a handful of `-e`
flags is enough, and Postgres deliberately stays outside Docker for now
per this phase's requirements. Compose becomes worth adding once there's
more than one container to coordinate (e.g. once Redis or the frontend
join the picture) — that's a natural fit for a later phase, not this one.

