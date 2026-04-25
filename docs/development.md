# Development

## Requirements

- Node.js 24+
- `pnpm`
- Docker, if you want local observability

## Install

```bash
pnpm install
```

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

Run CLI commands:

```bash
pnpm cli -- health
pnpm cli -- todos list
pnpm cli -- todos create "read docs"
```

## Environment Variables

### Server

- `PORT`: HTTP server port. Defaults to `3001`
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OTLP base URL. Defaults to `http://localhost:4318`
- `OTEL_SERVICE_NAME`: defaults to `todo-server`
- `OTEL_SERVICE_VERSION`: defaults to `0.1.0`

Set `OTEL_EXPORTER_OTLP_ENDPOINT=off` to disable tracing.

### Webapp

- `VITE_API_URL`: backend base URL. Defaults to `http://localhost:3001`
- `VITE_OTEL_EXPORTER_OTLP_ENDPOINT`: OTLP base URL. Defaults to `http://localhost:4318`
- `VITE_OTEL_SERVICE_NAME`: defaults to `todo-webapp`
- `VITE_OTEL_SERVICE_VERSION`: defaults to `0.1.0`

Set `VITE_OTEL_EXPORTER_OTLP_ENDPOINT=off` to disable tracing.

### CLI

- `API_URL`: backend base URL. Defaults to `http://localhost:3001`

## Common Issues

### CORS problems in the browser

The server is configured to allow the Vite dev origin `http://localhost:5173`.

If you change the webapp origin, update the CORS configuration in `apps/server/src/http/server.ts`.

### Jaeger only shows `jaeger-all-in-one`

That usually means one of these:

- the app has not generated traffic yet
- the dev server needs a restart after observability config changes
- the collector stack is not running

Start the stack:

```bash
pnpm observability:up
```

Then restart `pnpm dev` and generate traffic again.

### Port already in use

If `3001`, `5173`, `16686`, `4317`, or `4318` are busy, stop the conflicting process or change configuration before starting the stack.
