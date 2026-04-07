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
  cli/

packages/
  shared/
```

## Dependency Rules

- `packages/shared` must not depend on `apps/server`, `apps/webapp`, or `apps/cli`
- `apps/server` depends on `packages/shared`
- `apps/webapp` depends on `packages/shared`
- `apps/cli` depends on `packages/shared`

This keeps the contract portable and prevents server-specific or browser-specific details from leaking into shared code.

## API-First Flow

The shared package defines:

- domain schemas
- typed errors
- `HttpApi` root
- endpoint groups

The server implements handlers for those endpoints.

The webapp and CLI generate typed clients from the same `HttpApi`.

```text
packages/shared
  -> HttpApi definition

apps/server
  -> HttpApi handlers

apps/webapp / apps/cli
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

- React components
- atoms and UI state
- browser-side observability
- web-specific client configuration

### CLI

Put in `apps/cli`:

- debugging commands
- smoke-test friendly commands
- machine-readable output for automation and LLM workflows

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
5. Add client usage in `apps/webapp` or `apps/cli`

## Why This Structure Works Well

- clients and server stay aligned through the same contract
- refactors are safer because TypeScript sees both sides
- HTTP remains real, but the client code stays typed
- the CLI can exercise the real API without extra ad-hoc tooling
