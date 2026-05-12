# Development

## Requirements

- Node.js 24+
- `pnpm`
- Docker, if you want local observability

## Install

```bash
pnpm install
cp .env.example .env
```

The root `pnpm dev` command loads the root `.env` file for both apps.

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

Run linting and formatting checks:

```bash
pnpm lint
pnpm format
```

The lint configuration rejects explicit `any` and explicit `unknown` in project code. Prefer concrete unions, generics, or domain-specific types.

Run server tests:

```bash
pnpm --filter @app/server test
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

Start Storybook for visual component development:

```bash
pnpm --filter @app/webapp storybook
```

Build the static Storybook catalog:

```bash
pnpm --filter @app/webapp build-storybook
```

## Webapp Routing Notes

The webapp uses TanStack Router in SPA mode with hash history. Route wiring lives in `apps/webapp/src/router.tsx`; routes should define paths/params and render screens. Keep remote data in atoms and keep route URL/search state in router APIs.

## Environment Variables

Copy `.env.example` to `.env` before local development. Keep secrets out of committed files.

### Server

- `PORT`: HTTP server port. Defaults to `3001`
- `SQLITE_FILENAME`: SQLite database file. Defaults to `./.data/app.db` relative to the server process directory
- `AUTH_JWT_SECRET`: required signing secret for auth tokens
- `AUTH_JWT_ISSUER`: required JWT issuer
- `AUTH_JWT_AUDIENCE`: required JWT audience
- `AUTH_ACCESS_TOKEN_TTL_SECONDS`: token lifetime in seconds. Defaults to `3600`
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OTLP base URL. Omit in development or set to `off` to disable tracing
- `OTEL_SERVICE_NAME`: required only when server tracing is enabled
- `OTEL_SERVICE_VERSION`: required only when server tracing is enabled

### Webapp

- `VITE_API_URL`: backend base URL. Defaults to `http://localhost:3001`
- `VITE_OTEL_EXPORTER_OTLP_ENDPOINT`: OTLP base URL. Omit in development or set to `off` to disable tracing
- `VITE_OTEL_SERVICE_NAME`: required only when browser tracing is enabled
- `VITE_OTEL_SERVICE_VERSION`: required only when browser tracing is enabled

## Current Local Data

The example app persists users, user-owned projects, and user-owned todos in SQLite. With the default `.env.example`, the database file is `apps/server/.data/app.db` when running through `pnpm dev`.

## Common Issues

### Missing auth config

If the server fails during startup with missing `AUTH_JWT_*` variables, copy `.env.example` to `.env` or add those values to your existing `.env`.

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
