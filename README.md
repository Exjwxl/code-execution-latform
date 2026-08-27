# Forge Runner

A local code execution platform with a Next.js control plane, BullMQ/Redis queue adapter, PostgreSQL-ready compose stack, and Docker sandbox policy. The UI includes a playground, job monitor, test suites, worker fleet, queue dashboard, and sandbox control plane.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Full stack mode

Start PostgreSQL and Redis with Docker Desktop:

```bash
docker compose up -d
```

Copy `.env.example` to `.env.local`, then run the API and worker in separate terminals:

```bash
npm run dev
npm run worker
```

Without `REDIS_URL`, submissions use the built-in memory adapter so the project still runs locally. With Redis configured, the API publishes `code-execution` jobs to BullMQ and `npm run worker` consumes them with configurable `WORKER_CONCURRENCY`.

## Submission contract

`POST /api/submissions` accepts `language`, `source`, and `tests`, returning `202 Accepted` with a submission id, adapter, and queue metadata. `GET /api/jobs`, `GET /api/jobs/:id`, `GET /api/infrastructure`, and `GET /api/suites` back the operations views.
