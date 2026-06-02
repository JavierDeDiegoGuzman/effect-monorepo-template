# Architecture

## Goals

This template is an opinionated, clonable reference architecture for building real SaaS products with Effect. The example product modules are here to demonstrate the pattern; they are not the architectural authority when they diverge from this document.

The core goals are:

- Effect-first backend architecture
- one shared API contract
- typed clients instead of ad-hoc fetch calls
- strict backend layering from HTTP to persistence
- runtime-neutral shared contracts and runtime-local typed clients
- explicit persistence lifecycle and test setup
- vertical product/domain modules that scale across shared contracts, backend-domain, backend-infra, server transport, and webapp code

## Workspace Structure

```text
apps/
  server/
  webapp/

packages/
  shared/
  backend-domain/
  backend-infra/
```

`packages/shared` owns the public typed HTTP API contract. Apps create typed clients directly from that contract at their runtime boundary; this template intentionally does not include a separate `packages/api-client` package.

`packages/backend-domain` owns backend domain/application services, repository ports, storage-agnostic errors, the transaction contract, and in-memory domain test support.

`packages/backend-infra` owns backend infrastructure: database configuration and SQL clients, Effect SQL migrations, seed/CLI commands, SQLite/Postgres repository adapters, password/token live services, SQL transaction support, and SQL test layers.

`apps/server` owns HTTP transport handlers, auth cookie/session transport adaptation, server layer composition, observability/runtime setup, and server integration/smoke tests.

## Dependency Rules

- `packages/shared` must not depend on `packages/backend-domain`, `packages/backend-infra`, `apps/server`, or `apps/webapp`.
- `packages/backend-domain` may depend on `packages/shared`; it must not depend on `packages/backend-infra` or apps.
- `packages/backend-infra` may depend on `packages/backend-domain` and `packages/shared`; it must not depend on apps.
- `apps/server` depends on `packages/shared`, `packages/backend-domain`, and `packages/backend-infra`.
- `apps/webapp` depends on `packages/shared` only for product/runtime contracts.
- cross-module imports go through the target module's `index.ts`.
- module `internal/` folders are private to that module.

Executable architecture checks live at the repo root:

```bash
pnpm boundaries
pnpm verify:architecture
```

`pnpm verify:architecture` runs dependency-cruiser plus filesystem/module-layout checks. These checks enforce module indexes, prevent legacy architecture paths, reject direct API imports from screens/components, keep UI primitives feature-agnostic, prevent handlers from importing repositories, prevent repositories from importing HTTP transport code, and catch production imports from test helpers.

## Canonical Backend Request Flow

Every product/capability module follows this flow:

```text
HTTP handler -> Service/use-case Module -> Repository Interface -> Adapter
```

Responsibilities:

- **HTTP handler**: transport adapter only. It reads params/body/auth context, calls the service, and maps service/internal failures to the shared HTTP contract.
- **Service/use-case Module**: owns product behavior: ID generation, normalization, auth/scope/ownership rules, expected domain errors, repository coordination, transaction scopes for multi-repository invariants, and conversion to shared contract models.
- **Repository Interface**: storage-agnostic query port consumed by services. `repository.ts` owns repository input and record schemas.
- **Repository Adapter**: flat persistence implementation. It translates repository methods to memory/SQL operations and does not contain product logic.

Handlers must not call repositories directly. Repositories must not call HTTP code, construct shared response models, generate IDs, normalize product input, enforce domain authorization, sign tokens, hash passwords, or raise user-facing not-found/auth errors.

## Full-stack Module Layout

Product/domain/capability code uses `modules` consistently:

```text
packages/shared/src/modules/<module>/          # public schemas/API/errors
packages/backend-domain/src/modules/<module>/ # services, repository ports, memory adapters
packages/backend-infra/src/modules/<module>/  # SQL/Postgres adapters and live infra services
apps/server/src/modules/<module>/             # HTTP handlers/transport adapters
apps/webapp/src/modules/<module>/             # atoms and feature UI
```

Runtime/platform code stays outside `modules` under concrete top-level names such as `database`, `http`, `observability`, `layers`, and `test`. Database infrastructure lives in `packages/backend-infra/src/database`; HTTP and runtime composition live in `apps/server/src`.

## Shared Contract Layout

Shared module files use these responsibilities:

- `schema.ts`: primary domain/runtime schemas, including branded public IDs.
- `contract.ts`: endpoint request/response DTOs.
- `errors.ts`: exported typed, client-visible expected errors.
- `api.ts`: `HttpApiGroup` definitions with explicit success/error contracts.
- `middleware.ts`: shared middleware contracts when needed.
- `index.ts`: public module API.

The API root lives at `packages/shared/src/api.ts`.

Public/persisted entity IDs should be branded UUID strings, for example `UserId` and `TodoId`. Services generate new UUIDs inline with `Random.nextUUIDv4` and decode/brand them through shared schemas before persistence or response mapping.

## Backend Package Layout

Backend code is split by responsibility:

### `packages/backend-domain`

Domain modules are flat by default:

- `service.ts`: service/use-case tag and interface.
- `service.live.ts`: live service implementation.
- `repository.ts`: repository interface plus repository input/record schemas.
- `repository.memory.ts`: in-memory implementation for domain/unit tests and ephemeral demos.
- `*.test.ts`: fast domain/service tests with in-memory repositories.
- `index.ts`: public module API.

Cross-cutting domain files include:

- `src/errors/*`: storage-agnostic internal/domain errors such as repository errors.
- `src/transactions.ts`: storage-agnostic transaction contract used by domain services.
- `src/transactions.memory.ts`: no-op transaction adapter for in-memory domain tests.
- `src/test/layers/*`: in-memory repository and domain test layers.

### `packages/backend-infra`

Infrastructure modules and database code own live adapters:

- `src/modules/<module>/repository.sql.ts`: SQLite implementation using Effect SQL and `SqlSchema`.
- `src/modules/<module>/repository.postgres.ts`: Postgres implementation using Effect SQL and `SqlSchema`.
- `src/modules/auth/passwords.service.live.ts` and `tokens.service.live.ts`: live password/token services.
- `src/database/*`: database config, SQL clients, migrations, seed data, CLI, SQL transaction adapter, and SQL repository helpers.
- `src/test/layers/*`: temporary SQLite and SQL repository test layers.

### `apps/server`

The server app owns transport and runtime assembly:

- `src/modules/<module>/handlers.ts`: HTTP transport adaptation only; calls services, not repositories.
- `src/modules/auth/session-cookie.ts`: auth cookie/session transport adapter.
- `src/http/*`: HTTP server assembly, middleware, and HTTP error mapping.
- `src/layers/ServerLayers.ts`: server application layer composition.
- `src/observability/*`: tracing/runtime observability setup.
- `src/test/*`: in-process HTTP integration and smoke tests.

## Layer Composition Policy

Application composition lives in `apps/server/src/layers/ServerLayers.ts`. This file is the canonical seam for combining backend-infra repository adapters, backend-domain services, auth/session infrastructure, and HTTP dependencies.

Rules:

- Runtime entrypoints use `DevServerDependenciesLayer` or `ProdServerDependenciesLayer` rather than assembling modules inline.
- Tests reuse the same composition helpers with test adapters, for example `makeSqliteRepositoryLayer(makeTestSqliteLayer(...))` and `makeProductDomainLayer(...)`.
- Repository variants are composed once per adapter family: memory, SQLite, and Postgres.
- Product domain composition (`UsersLive`, `TodosLive`) is separate from full application domain composition so fast domain tests can avoid auth token configuration unless they are testing auth behavior.
- Adding a product module should update this composition seam and the thin test-layer reexports, not duplicate module relationship knowledge in each test.

## Repository Policy

Repositories are strict query adapters.

Rules:

- `repository.ts` defines and exports `Schema` values and types for every repository input and record, using names such as `CreateTodoRepositoryInput` and `TodoRepositoryRecord`.
- Repository methods accept/return repository types, not HTTP DTOs or UI models.
- Memory, SQLite, and Postgres adapters implement the same repository interface.
- SQL adapters must use `SqlSchema` for every persistent operation, including writes that return no domain row.
- SQL adapters should keep persistence mechanics such as SQL failure mapping, optional row selection, and read-back checks behind repository/helper modules instead of repeating them at call sites.
- SQL queries should alias columns to match repository schemas directly.
- Repositories surface internal persistence errors; services/handlers decide whether those become expected domain errors or safe `InternalServerError` responses.
- Repositories never generate IDs. Creation services generate IDs before calling repositories.
- Repositories never contain product logic such as title normalization, ownership policy, password verification, JWT behavior, or client-visible not-found decisions.

## Persistence Policy

Canonical persistence adapters:

- `memory`: domain/unit tests and ephemeral demos.
- `sqlite`: local SQL development and programmatic e2e tests.
- `postgres`: production SQL.

JSON persistence and Drizzle are not part of the product/runtime template. Do not add JSON or Drizzle adapters for new modules or tests.

Persistence lifecycle is explicit infrastructure:

- runtime startup validates required configuration and runs pending Effect SQL schema migrations before repositories are used;
- migrations live in `packages/backend-infra/src/database/migrations/*` and are registered in `packages/backend-infra/src/database/migrations.ts`;
- the migrator records completed migrations in `effect_sql_migrations`;
- demo seed data lives outside migrations in `packages/backend-infra/src/database/seed.ts`;
- normal request handling must not silently create or mutate application schema;
- e2e tests create temporary SQLite databases and run the same migration runner before each test layer.

## Error Policy

Errors are split into expected public errors and internal errors:

- Expected client-visible failures live in shared module `errors.ts` files or cross-cutting `packages/shared/src/errors.ts` and are declared in `api.ts` with explicit HTTP status/body contracts.
- If a client or UI should branch on an error, render custom copy for it, retry it differently, redirect because of it, or show an inline validation state for it, the error must be a shared typed contract error.
- Do not use generic `Error`, string failures, ad-hoc `Effect.fail` values, or `Effect.orDie` for user-manageable failures.
- Public domain error messages are fixed with schema constructor defaults; call sites pass semantic fields such as `id` or `email`, not user-facing copy.
- Invalid route params/body payloads should fail contract decoding as 400-level input errors, not fall through to not-found behavior. Structural validation errors use Effect HttpApi/schema validation and do not guarantee fixed user-facing messages.
- Repository adapters surface server-only `RepositoryError` for operational failures instead of dying. Services propagate `RepositoryError` alongside expected domain errors.
- Transaction adapters must preserve expected domain errors from the wrapped effect; SQL transaction begin/commit/rollback failures map to server-only `RepositoryError` rather than defects.
- Handlers use the HTTP error mapping seam to convert `RepositoryError` and unexpected defects to the shared safe `InternalServerError` contract.
- Services may map repository results to expected domain errors when the product semantics are known, for example `TodoNotFound` for a scoped todo update that affects no row.

## Webapp Layout

The webapp composes screens from patterns and modules:

```text
router -> screens -> modules/<module> + patterns + ui
```

- `src/components/ui/*`: shadcn/ui primitives and direct shadcn-generated wrappers.
- `src/components/patterns/*`: reusable layout/screen recipes.
- `src/components/screen-parts/*`: screen-specific presentational pieces for non-module surfaces.
- `src/modules/<module>/atoms.ts`: remote/shared state and mutations.
- `src/modules/<module>/components/*`: module-specific UI.
- `src/components/screens/*`: thin route-level composition.

`dashboard` is a screen/composition surface, not a product module.

Canonical frontend flow:

```text
Screen/components -> feature atoms -> ApiClient
```

Screens/components should not call the API client directly. Feature atoms own remote state, mutations, invalidation, and frontend use-case/state transitions. The webapp API adapter/atoms own cookie credentials behavior, logout invalidation, and UI reaction to auth failures.

## Product Module Checklist

When adding a persisted product module:

1. Define shared schemas, branded IDs, contracts, and expected errors.
2. Define repository inputs/records and the repository interface in `packages/backend-domain/src/modules/<module>/repository.ts`.
3. Implement the memory adapter in `packages/backend-domain` for unit/domain tests.
4. Implement the SQLite adapter in `packages/backend-infra` with `SqlSchema` for every operation.
5. Implement the Postgres adapter in `packages/backend-infra` with `SqlSchema` for every operation.
6. Add/extend numbered Effect SQL migrations in `packages/backend-infra` for SQLite and Postgres syntax, and keep seed/backfill logic separate from schema migrations.
7. Add the service/use-case module in `packages/backend-domain`.
8. Add HTTP handlers in `apps/server` that call the service only.
9. Add backend tests: domain/unit tests with memory and e2e tests through the typed client.
10. Add webapp atoms using the API client.
11. Add feature UI components.
12. Compose screens/routes/navigation.
13. Add observability spans/annotations around remote operations and important use cases.
14. Update docs.

## Migration Note

The product/runtime template uses branded UUID strings for public and persisted entity IDs. New work should not introduce transitional numeric public IDs or legacy fixture paths. See [`database.md`](./database.md) for the concrete schema migration workflow.
