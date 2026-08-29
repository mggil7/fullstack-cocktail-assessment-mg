# Cocktail Recipes App

A small fullstack app for browsing and adding cocktail recipes.
Vue 3 frontend, NestJS + TypeORM backend, PostgreSQL database,
orchestrated with Docker Compose.

## Features

- **List view** (`/`) — all cocktails with live *search by description*
  (case-insensitive, server-side filtering, debounced input).
- **Details view** (`/cocktails/:id`) — click any cocktail in the list to see
  its full recipe, glass type and price. Deep links and refresh work.
- **New cocktail** (`/new`) — create a cocktail with inline feedback:
  validation errors (400) and duplicate-title conflicts (409) are shown to
  the user; on success the form links to the created cocktail.
- **OpenAPI docs** — interactive Swagger UI at
  [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
  (raw spec at `/api/docs-json`).
- **Integration tests** — the API is covered end-to-end against a real
  PostgreSQL instance (see below).

## Getting started

Prerequisites: Docker + Docker Compose.

```bash
docker compose up --build
```

| Service       | URL                              |
|---------------|----------------------------------|
| Frontend      | http://localhost:8080            |
| Backend API   | http://localhost:3000/cocktails  |
| Swagger UI    | http://localhost:3000/api/docs   |
| PostgreSQL    | localhost:5432 (user/password)   |

The database is seeded automatically from `db-init.sql` on first start.
To re-seed from scratch: `docker compose down -v && docker compose up --build`.

## API overview

| Method | Path                     | Description                              | Errors        |
|--------|--------------------------|------------------------------------------|---------------|
| GET    | `/cocktails`             | List cocktails; `?search=` filters by description | —      |
| GET    | `/cocktails/:id`         | Single cocktail                          | 400, 404      |
| POST   | `/cocktails`             | Create a cocktail (unique title)         | 400, 409      |

Full request/response schemas are in the Swagger UI.

## Running the integration tests

The e2e suite runs against a real Postgres (the same one from
docker-compose) to exercise real DB behavior — unique constraints,
`ILIKE` search, `DECIMAL` handling.

```bash
docker compose up -d db
cd backend
npm install
DATABASE_URL=postgres://user:password@localhost:5432/mydatabase npm run test:e2e
```

Tests create their own uniquely-named rows and clean up after themselves,
so they are safe to run repeatedly against the seeded database.

## Design notes & trade-offs

- **Server-side search** — filtering lives with the data, so it stays
  correct if the dataset grows or the API paginates. For the current
  dataset a client-side filter would also have worked; the backend filter
  matches the assignment's "complete the search functionality" intent.
- **Uniqueness via the DB constraint** — the 409 comes from catching the
  Postgres unique-violation (code `23505`), not from a pre-check query,
  because a pre-check is racy under concurrency.
- **Code-first OpenAPI** — the spec is generated from decorators, so the
  docs cannot drift from the implementation.
- **ElasticSearch fuzzy search** — intentionally not implemented; the
  bonus scope chosen instead was OpenAPI docs + integration tests.
