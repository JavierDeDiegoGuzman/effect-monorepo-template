# Architecture

## Goals

This template is designed around a small number of rules:

- one shared API contract
- clear separation between portable code and runtime-specific code
- typed clients instead of ad-hoc fetch calls
- layered backend code with transport handlers, domain services, and repositories
- vertical product/domain modules that scale across shared, server, and webapp code

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
- cross-module imports go through the target module's `index.ts`
- module `internal/` folders are private to that module

Executable architecture checks live at the repo root:

```bash
pnpm boundaries
pnpm verify:architecture
```

`pnpm verify:architecture` runs dependency-cruiser plus filesystem/module-layout checks.

## Full-stack module layout

Product/domain/capability code uses `modules` consistently:

```text
packages/shared/src/modules/<module>/
apps/server/src/modules/<module>/
apps/webapp/src/modules/<module>/
```

Runtime/platform code stays outside `modules` under concrete top-level names such as `database`, `http`, `observability`, `layers`, and `test`.

## Shared contract layout

Shared module files use these responsibilities:

- `schema.ts`: primary domain/runtime schemas
- `contract.ts`: endpoint request/response DTOs
- `errors.ts`: exported typed errors
- `api.ts`: `HttpApiGroup` definitions
- `middleware.ts`: shared middleware contracts when needed
- `index.ts`: public module API

The API root lives at `packages/shared/src/api.ts`.

## Server layout

Server modules are flat by default:

- `handlers.ts`: transport adaptation only
- `service.ts`: domain service tag/contract
- `service.live.ts`: live domain implementation
- `repository.ts`: repository contract
- `repository.sql.ts`: SQL implementation
- `repository.memory.ts`: in-memory/test implementation
- `*.test.ts`: module-specific tests
- `index.ts`: public module API

Server runtime/platform code remains in:

- `src/database`: SQLite client, schema, and transaction layers
- `src/http`: HTTP server assembly and middleware
- `src/observability`: tracing setup
- `src/layers`: production layer composition
- `src/test`: reusable test layers and integration tests

## Webapp layout

The webapp composes screens from patterns and modules:

```text
router -> screens -> modules/<module> + patterns + ui
```

- `src/components/ui/*`: shadcn/ui primitives
- `src/components/patterns/*`: reusable layout/screen recipes
- `src/components/screen-parts/*`: screen-specific presentational pieces for non-module surfaces
- `src/modules/<module>/atoms.ts`: remote/shared state
- `src/modules/<module>/components/*`: module-specific UI
- `src/components/screens/*`: thin route-level composition

`dashboard` is a screen/composition surface, not a product module.

## Current Example

The example app includes auth, users, todos, and system health modules. Users own todos, and the webapp exposes a global todo workflow as the main protected product surface.

The example SQLite file is configured with `SQLITE_FILENAME=./.data/app.db`, relative to the server process directory (`apps/server` when using `pnpm dev`).

## Recommended Feature Workflow

When adding a new product module:

1. Define shared schemas/contracts/errors/API under `packages/shared/src/modules/<module>`.
2. Implement repositories, services, handlers, and module tests under `apps/server/src/modules/<module>`.
3. Wire production/test layers from module indexes.
4. Add atoms and feature components under `apps/webapp/src/modules/<module>`.
5. Compose route screens from module indexes plus patterns/ui.
6. Update docs and architecture checks when boundaries change.
