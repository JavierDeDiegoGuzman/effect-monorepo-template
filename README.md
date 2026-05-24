# Effect Monorepo Template

An opinionated `pnpm` monorepo template for building full-stack TypeScript applications with `effect` v4 beta.

This template includes a small authenticated SaaS-style example, but the real goal is the architecture:

- shared API and domain schemas in `packages/shared`
- Effect HTTP server in `apps/server`
- SQLite-backed repositories and domain services
- React webapp in `apps/webapp`
- typed HTTP integration tests using the shared API contract
- optional local OTLP tracing with Jaeger

## What This Template Includes

- `effect` v4 beta
- `pnpm` workspaces
- shared `HttpApi` definition
- server handlers implemented from the shared API
- typed HTTP clients in the webapp and integration tests
- React + `@effect/atom-react`
- Storybook for visual component development
- Vitest + Testing Library for webapp component tests
- SQLite persistence for auth, users, and user-owned todos
- Effect SQL schema migrations with separated demo seed data
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
  database.md
  observability.md
  storybook.md
  testing.md
  webapp-architecture.md
```

## Architecture

The core rule is simple:

- `packages/shared` defines the domain and API contract
- `apps/server` implements that API with transport handlers, domain services, and SQLite repositories
- `apps/webapp` and server integration tests consume the same API through typed clients

```text
React UI / integration tests
  -> typed HttpApiClient
  -> Effect HTTP server
  -> domain services
  -> SQLite repositories
```

Executable checks keep those boundaries healthy:

```bash
pnpm verify:architecture
```

## Current Example App

The included example covers:

- registration, login, logout, and session-cookie protected endpoints
- per-user sessions
- user-owned global todos
- SQLite persistence under `apps/server/.data` by default
- typed HTTP integration coverage

## Quickstart

Install dependencies:

```bash
pnpm install
```

Create your local environment file:

```bash
cp .env.example .env
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

Tracing is disabled in `.env.example`. To enable it locally, run `pnpm observability:up` and set both OTLP endpoint variables in `.env` to `http://localhost:4318`.

## Testing

Server integration tests exercise the real HTTP API through `HttpApiClient` and the shared contract:

```bash
pnpm --filter @app/server test
```

Webapp component tests use Vitest and Testing Library:

```bash
pnpm --filter @app/webapp test
```

Storybook provides a visual component workshop:

```bash
pnpm --filter @app/webapp storybook
```

See [`docs/testing.md`](./docs/testing.md) and [`docs/storybook.md`](./docs/storybook.md) for the recommended patterns.

## Main Commands

```bash
pnpm dev
pnpm dev:demo
pnpm db:migrate
pnpm db:reset
pnpm db:seed
pnpm build
pnpm check
pnpm verify:architecture
pnpm --filter @app/server test
pnpm --filter @app/webapp test
pnpm --filter @app/webapp storybook
pnpm --filter @app/webapp build-storybook
pnpm observability:up
pnpm observability:down
```

## How To Extend This Template

To add a new feature or domain:

1. Add shared schemas, errors, and endpoint groups in `packages/shared/src/modules/<module>` and export them through `packages/shared/src/api.ts` as needed
2. Add or extend server repositories, domain services, and HTTP handlers inside `apps/server/src/modules/<module>`
3. Wire repository/domain layers through `apps/server/src/layers/ServerLayers.ts` and test layers when the backend adds services
4. Add webapp atoms and feature components in `apps/webapp/src/modules/<module>` when the UI consumes the API
5. Compose route-level screens from the module UI in `apps/webapp/src/components/screens` and update navigation/router wiring as needed
6. Update docs, tests, and executable architecture checks when boundaries change

## Documentation

- [`docs/architecture.md`](./docs/architecture.md)
- [`docs/development.md`](./docs/development.md)
- [`docs/database.md`](./docs/database.md)
- [`docs/api.md`](./docs/api.md)
- [`docs/observability.md`](./docs/observability.md)
- [`docs/storybook.md`](./docs/storybook.md)
- [`docs/testing.md`](./docs/testing.md)
- [`docs/webapp-architecture.md`](./docs/webapp-architecture.md)
