# Development

## Requirements

- Node.js 24+
- `pnpm`
- Docker, if you want local observability or local Postgres

## Install

```bash
pnpm install
cp .env.example .env
```

The root `pnpm dev` command loads the root `.env` file for both apps. Backend database commands also load the root `.env` before delegating to `@app/backend-infra`.

## Run Locally

Start the webapp and server together:

```bash
pnpm dev
```

Press `Ctrl+C` once to stop both processes. The root development command runs the server and webapp concurrently and stops both when either process exits.

Default URLs:

- webapp: `http://localhost:5173`
- server: `http://localhost:3001`
- scalar docs: `http://localhost:3001/docs`
- openapi: `http://localhost:3001/openapi.json`

## Commands

Typecheck all workspaces:

```bash
pnpm check
```

Build all workspaces:

```bash
pnpm build
```

Run linting checks and intentional formatting rewrites:

```bash
pnpm lint
pnpm lint:fix
pnpm format
```

`pnpm lint` checks formatting and lint rules without writing. `pnpm lint:fix` applies Biome safe fixes and then reruns the type-assertion guard. `pnpm format` rewrites formatting with Biome and should be used intentionally, not mixed into unrelated changes.

The lint configuration rejects explicit `any` and explicit `unknown` in project code. Prefer concrete unions, generics, or domain-specific types.

Run local SQLite database commands:

```bash
pnpm db:migrate
pnpm db:reset
pnpm db:seed
pnpm dev:demo
```

`pnpm dev:demo` resets the local SQLite file, seeds demo rows, and starts the server and webapp. Root DB commands target the `@app/backend-infra` package, which owns database config, migrations, seed data, and CLI entrypoints. Postgres migration and seed helpers are available as `pnpm db:migrate:postgres` and `pnpm db:seed:postgres`; there is intentionally no scripted Postgres reset.

Direct package commands use the backend-infra workspace:

```bash
pnpm --filter @app/backend-infra db:migrate
pnpm --filter @app/backend-infra db:reset
pnpm --filter @app/backend-infra db:seed
pnpm --filter @app/backend-infra db:migrate:postgres
pnpm --filter @app/backend-infra db:seed:postgres
```

Run server tests:

```bash
pnpm --filter @app/server test
```

Run no-network server smoke flows through the typed HTTP client:

```bash
pnpm smoke:server
```

Run webapp component tests:

```bash
pnpm --filter @app/webapp test
```

Run architecture boundary checks:

```bash
pnpm boundaries
pnpm verify:architecture
```

CI runs workspace checks, tests, builds, `pnpm verify:architecture`, `pnpm smoke:server`, and `pnpm lint` on pull requests and pushes to `main`.

Start Storybook for visual component development:

```bash
pnpm --filter @app/webapp storybook
```

Build the static Storybook catalog:

```bash
pnpm --filter @app/webapp build-storybook
```

## Canonical Local Persistence

Canonical persistence adapters are:

- `memory`: domain/unit tests and ephemeral demos;
- `sqlite`: local SQL development and programmatic e2e tests;
- `postgres`: production SQL.

JSON persistence and Drizzle are removed from the product/runtime template. Do not add JSON or Drizzle adapters for new modules.

SQLite is the default local SQL path. Postgres remains the production adapter and can be run locally through Docker for prod-like checks. Programmatic smoke tests create isolated temporary SQLite databases through the backend-infra test layers and compose them into the server HTTP test layer.

Persistence lifecycle is migration-based:

- startup validates required config and runs pending Effect SQL migrations before repositories are used;
- schema migrations live under `packages/backend-infra/src/database/migrations/*` and are registered in `packages/backend-infra/src/database/migrations.ts`;
- completed migrations are tracked in `effect_sql_migrations`;
- demo seed data lives in `packages/backend-infra/src/database/seed.ts`, separate from schema migrations;
- normal request handling does not silently create or mutate tables;
- tests create temporary SQLite databases and run the same migration runner.

See [`database.md`](./database.md) for the migration workflow and command details.

## Webapp Routing Notes

The webapp uses TanStack Router in SPA mode with hash history. Route wiring lives in `apps/webapp/src/router.tsx`; routes define paths/params, auth redirects, not-found behavior, app-shell outlet wiring, and screen rendering. Keep remote data in atoms and keep links, active route state, and URL/search state in TanStack Router APIs instead of custom route helper models.

## Environment Variables

Copy `.env.example` to `.env` before local development. Keep secrets out of committed files.

### Server

Canonical variables:

- `PORT`: required HTTP server port
- `DATABASE_URL`: Postgres connection URL for production/prod-like runs
- `SQLITE_FILENAME`: SQLite database file for local SQL development or explicit SQLite layers. Defaults to `./.data/app.db` from the server working directory.
- `AUTH_JWT_SECRET`: required signing secret for auth tokens
- `AUTH_JWT_ISSUER`: required JWT issuer
- `AUTH_JWT_AUDIENCE`: required JWT audience
- `AUTH_ACCESS_TOKEN_TTL_SECONDS`: token/session lifetime in seconds. Defaults to `3600`
- `AUTH_SESSION_COOKIE_SAME_SITE`: optional session cookie SameSite policy: `lax`, `strict`, or `none`. Defaults to `lax`
- `AUTH_SESSION_COOKIE_SECURE`: optional boolean for the session cookie `Secure` flag. Defaults to `false`; use `true` for HTTPS production deployments
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OTLP base URL. Omit in development or set to `off` to disable tracing
- `OTEL_SERVICE_NAME`: required only when server tracing is enabled
- `OTEL_SERVICE_VERSION`: required only when server tracing is enabled

### Webapp

- `VITE_API_URL`: backend base URL. Defaults to `http://localhost:3001`
- `VITE_OTEL_EXPORTER_OTLP_ENDPOINT`: OTLP base URL. Omit in development or set to `off` to disable tracing
- `VITE_OTEL_SERVICE_NAME`: required only when browser tracing is enabled
- `VITE_OTEL_SERVICE_VERSION`: required only when browser tracing is enabled

## Current Migration Note

The product/runtime template now uses only `memory`, `sqlite`, and `postgres` persistence adapters. SQLite is used for local development and programmatic e2e tests; Postgres is used for production/prod-like runs.

If your local database contains stale tables or columns from older example modules, stop the server and delete/reset the local database file before rerunning setup. The next startup will run pending migrations again for the fresh database.

## Common Issues

### Missing server config

If the dev server fails during startup with missing `PORT` or `AUTH_JWT_*` variables, copy `.env.example` to `.env` or add those values to your existing `.env`. If the production server fails, also provide `DATABASE_URL` and make sure Postgres is reachable.

### CORS problems in the browser

The server is configured to allow the Vite dev origin `http://localhost:5173`.

If you change the webapp origin, update the CORS configuration in `apps/server/src/http/server.ts`.

### Jaeger only shows `jaeger-all-in-one`

That usually means one of these:

- tracing is disabled in `.env`
- the app has not generated traffic yet
- the dev server needs a restart after observability config changes
- the collector stack is not running

Start the stack:

```bash
pnpm observability:up
```

Then set both OTLP endpoint variables to `http://localhost:4318`, restart `pnpm dev`, and generate traffic again.

### Port already in use

If `3001`, `5173`, `16686`, `4317`, or `4318` are busy, stop the conflicting process or change configuration before starting the stack.
