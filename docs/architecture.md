# Architecture

## Goals

This template is designed around a small number of rules:

- one shared API contract
- clear separation between portable code and runtime-specific code
- typed clients instead of ad-hoc fetch calls
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

The server implements handlers for those endpoints.

The webapp and HTTP integration tests generate typed clients from the same `HttpApi`. Storybook stories and webapp component tests stay at the React boundary with mocked props/fixtures, so visual and behavioral component coverage does not require the API server.

```text
packages/shared
  -> HttpApi definition

apps/server
  -> HttpApi handlers

apps/webapp / apps/server tests
  -> HttpApiClient consumers
```

## Runtime Boundaries

### Shared

Put in `packages/shared`:

- `Schema` models
- tagged errors
- API definitions
- shared types and validation rules

Do not put in `packages/shared`:

- Node-specific code
- browser-specific code
- database clients
- fetch configuration tied to a specific app

### Server

Put in `apps/server`:

- infrastructure
- database access
- service implementations
- handler wiring
- environment-specific layers

### Webapp

Put in `apps/webapp`:

- React components organized by `ui`, `patterns`, `domain`, and `screens`
- TanStack Router SPA route definitions and app-shell outlet wiring
- atoms and UI state
- browser-side observability
- web-specific client configuration
- Storybook stories for visual component states
- Vitest/Testing Library component tests for user-visible behavior

Screens are connected composition boundaries and should not own structural markup directly. Route files should render screens, not feature UI.

## Current Example

The initial todo app is intentionally minimal.

The `Todos` service in `apps/server` uses an in-memory `Map`, so data is reset on restart.

That is a deliberate template choice:

- easy to understand
- fast to iterate on
- obvious place to replace with real persistence later

## Recommended Feature Workflow

When adding a new feature:

1. Define domain schemas in `packages/shared/src/domain`
2. Define API endpoints in `packages/shared/src/api`
3. Implement or extend a service in `apps/server/src/services`
4. Implement handlers in `apps/server/src/http/handlers`
5. Add client usage in `apps/webapp` or server integration tests

## Why This Structure Works Well

- clients and server stay aligned through the same contract
- refactors are safer because TypeScript sees both sides
- HTTP remains real, but the client code stays typed
- server integration tests can exercise the real API without extra ad-hoc tooling
