# Architecture

## Goals

This template is designed around a small number of rules:

- one shared API contract
- clear separation between portable code and runtime-specific code
- typed clients instead of ad-hoc fetch calls
- layered backend code with transport handlers, domain services, and repositories
- a monorepo layout that scales to multiple apps

## Workspace Structure

```text
apps/
  server/
  webapp/

packages/
  shared/
```

## Dependency Rules

- `packages/shared` must not depend on `apps/server` or `apps/webapp`
- `apps/server` depends on `packages/shared`
- `apps/webapp` depends on `packages/shared`

This keeps the contract portable and prevents server-specific or browser-specific details from leaking into shared code.

Executable architecture checks live at the repo root:

```bash
pnpm boundaries
pnpm verify:architecture
```

The webapp checks also enforce component-layer import boundaries, screen/route markup ownership, and the synchronization-hook policy. See [`docs/webapp-architecture.md`](./webapp-architecture.md).

## API-First Flow

The shared package defines:

- domain schemas
- typed errors
- `HttpApi` root
- endpoint groups
- auth middleware requirements

The server implements handlers for those endpoints. Protected groups use bearer-token authorization and provide the current user to handlers.

The webapp and HTTP integration tests generate typed clients from the same `HttpApi`. Storybook stories and webapp component tests stay at the React boundary with mocked props/fixtures, so visual and behavioral component coverage does not require the API server.

```text
packages/shared
  -> HttpApi definition

apps/server
  -> HttpApi handlers
  -> domain services
  -> repositories
  -> SQLite

apps/webapp / apps/server tests
  -> HttpApiClient consumers
```

## Runtime Boundaries

### Shared

Put in `packages/shared`:

- domain `Schema` models for resources that cross process/client boundaries
- tagged errors
- API definitions
- endpoint-specific request/response schemas beside their API group
- shared structural validation rules

Do not put in `packages/shared`:

- Node-specific code
- browser-specific code
- database clients
- fetch configuration tied to a specific app

### Server

Put in `apps/server`:

- `src/http`: HTTP server setup, route assembly, handlers, middleware, and HTTP-owned config
- `src/database`: SQLite client setup and schema initialization
- `src/observability`: server tracing setup and observability-owned config
- `src/layers`: production layer composition for repositories, domain services, auth helpers, and server dependencies
- `src/repositories`: repository folders grouped by resource. Each repository folder contains four files: the service contract (`<Name>Repository.ts`), SQL implementation (`Sql<Name>Repository.ts`), JSON/in-memory implementation for tests (`Json<Name>Repository.ts`), and `index.ts` exports.
- `src/services`: domain service implementations
- `src/test`: reusable test layers and fixtures

### Webapp

Put in `apps/webapp`:

- React primitives and layout recipes organized under `components/ui` and `components/patterns`
- feature UI and remote state organized under `features/<feature>`
- TanStack Router SPA route definitions and app-shell outlet wiring
- browser-side observability
- web-specific client configuration
- Storybook stories for visual component states
- Vitest/Testing Library component tests for user-visible behavior

Screens are connected composition boundaries and should not own structural markup directly. Route files should render screens, not feature UI.

## Current Example

The example app includes:

- auth registration/login and `/auth/me`
- bearer-token protected projects and todos endpoints
- users, user-owned projects, and user-owned todos persisted in SQLite
- global todo listing plus project-scoped todo listing at `/projects/:projectId/todos`
- project detail UI that shows related todos

The example SQLite file is configured with `SQLITE_FILENAME=./.data/app.db`, relative to the server process directory (`apps/server` when using `pnpm dev`).

## Recommended Feature Workflow

When adding a new feature:

1. Define reusable domain schemas in `packages/shared/src/domain`
2. Define API endpoints and endpoint-specific payload schemas in `packages/shared/src/api`
3. Implement or extend repository contracts and persistence in `apps/server/src/repositories`
4. Implement or extend service folders in `apps/server/src/services/<feature>`
5. Implement handlers in `apps/server/src/http/handlers`
6. Add webapp feature atoms/components in `apps/webapp/src/features/<feature>` or server integration tests
7. Update relevant docs and architecture checks

## Why This Structure Works Well

- clients and server stay aligned through the same contract
- refactors are safer because TypeScript sees both sides
- HTTP remains real, but the client code stays typed
- server integration tests can exercise the real API without extra ad-hoc tooling
- persistence is replaceable behind repository contracts
- runtime config stays local to the module/layer that consumes it, so missing required config fails the owning layer during startup
