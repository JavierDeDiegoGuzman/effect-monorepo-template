# Effect Monorepo Template

An opinionated `pnpm` monorepo template for building full-stack TypeScript applications with `effect` v4 beta.

This template starts with a small todo app, but the real goal is the architecture:

- shared API and domain schemas in `packages/shared`
- HTTP server implemented with Effect in `apps/server`
- React webapp in `apps/webapp`
- typed HTTP integration tests using the shared API contract
- optional local OTLP tracing with Jaeger

## What This Template Includes

- `effect@4.0.0-beta.43`
- `pnpm` workspaces
- shared `HttpApi` definition
- server handlers implemented from the shared API
- typed HTTP clients in the webapp and integration tests
- React + `@effect/atom-react`
- local observability stack with OTLP Collector + Jaeger

## Repository Layout

```text
apps/
  server/    Effect HTTP server
  webapp/    React application using atoms

packages/
  shared/    Domain schemas, errors, and shared HttpApi definition

docs/
  api.md
  architecture.md
  development.md
  observability.md
  testing.md
```

## Architecture

The core rule is simple:

- `packages/shared` defines the domain and the API
- `apps/server` implements that API
- `apps/webapp` and server integration tests consume the same API through typed clients

```text
React UI / integration tests
  -> typed HttpApiClient
  -> Effect HTTP server
  -> domain service implementation
```

This means the API contract lives in one place and both client and server compile against it.

## Current Example App

The included example is intentionally small:

- authenticated todos and projects
- SQLite persistence
- typed HTTP integration coverage

This keeps the template easy to understand while preserving the full architecture you will likely want in a real project.

## Quickstart

Install dependencies:

```bash
pnpm install
```

Set the required environment variables:

```bash
export PORT=3001
export VITE_API_URL=http://localhost:3001
export OTEL_EXPORTER_OTLP_ENDPOINT=off
export VITE_OTEL_EXPORTER_OTLP_ENDPOINT=off
```

If you want tracing enabled locally, use these instead:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_SERVICE_NAME=todo-server
export OTEL_SERVICE_VERSION=0.1.0
export VITE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export VITE_OTEL_SERVICE_NAME=todo-webapp
export VITE_OTEL_SERVICE_VERSION=0.1.0
```

Start the server and webapp:

```bash
pnpm dev
```

Open:

- webapp: `http://localhost:5173`
- server: `http://localhost:3001`
- scalar docs: `http://localhost:3001/docs`
- openapi: `http://localhost:3001/openapi.json`

## Testing The API

Server integration tests exercise the real HTTP API through `HttpApiClient` and the shared contract:

```bash
pnpm --filter @app/server test
```

See [`docs/testing.md`](./docs/testing.md) for the recommended pattern.

## Configuration

Configuration is now local to each app/service:

- `apps/server/src/http/config.ts` owns `PORT`
- `apps/server/src/observability.config.ts` owns server OTLP config
- `apps/webapp/src/api/config.ts` owns `VITE_API_URL`
- `apps/webapp/src/observability.config.ts` owns browser OTLP config

Startup now fails early when required config is missing or invalid.

## Observability

Start the local observability stack:

```bash
pnpm observability:up
```

Then open Jaeger:

```text
http://localhost:16686
```

The services you should expect to see are:

- `todo-server`
- `todo-webapp`

Stop the stack with:

```bash
pnpm observability:down
```

More details: [`docs/observability.md`](./docs/observability.md)

## Main Commands

```bash
pnpm dev
pnpm build
pnpm check
pnpm --filter @app/server test
pnpm observability:up
pnpm observability:down
```

## How To Extend This Template

To add a new feature or domain:

1. Add schemas and errors in `packages/shared/src/domain`
2. Add endpoints/groups in `packages/shared/src/api`
3. Implement handlers in `apps/server/src/http/handlers`
4. Add or update domain services in `apps/server/src/services`
5. Consume the API from `apps/webapp` or server integration tests

## Good Next Steps For Real Projects

Typical evolutions after cloning this template:

1. Replace the in-memory todo store with a real persistence layer
2. Add auth middleware to the shared API and implement it in the server
3. Add integration tests using real HTTP and `HttpApiClient`
4. Add more bounded contexts under the same API-first approach

## Documentation

- [`docs/architecture.md`](./docs/architecture.md)
- [`docs/development.md`](./docs/development.md)
- [`docs/api.md`](./docs/api.md)
- [`docs/observability.md`](./docs/observability.md)
- [`docs/testing.md`](./docs/testing.md)
