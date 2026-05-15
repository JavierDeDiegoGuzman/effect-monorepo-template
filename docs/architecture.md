# Architecture

## Goals

This template is an opinionated, clonable reference architecture for building real SaaS products with Effect. The example product modules are here to demonstrate the pattern; they are not the architectural authority when they diverge from this document.

The core goals are:

- Effect-first backend architecture
- one shared API contract
- typed clients instead of ad-hoc fetch calls
- strict backend layering from HTTP to persistence
- runtime-neutral shared contracts and client packages
- explicit persistence lifecycle and test setup
- vertical product/domain modules that scale across shared, server, and webapp code

## Workspace Structure

```text
apps/
  server/
  webapp/

packages/
  shared/
  api-client/   # planned canonical runtime-neutral client package
```

`packages/api-client` is the canonical target for generated/typed API client code. During migration, the webapp may still contain a local client wrapper; new client behavior should move toward the package-level client.

## Dependency Rules

- `packages/shared` must not depend on `apps/server` or `apps/webapp`.
- `packages/api-client` depends on `packages/shared`, not on server or webapp runtime code.
- `apps/server` depends on `packages/shared`.
- `apps/webapp` depends on `packages/shared` and may depend on `packages/api-client`.
- cross-module imports go through the target module's `index.ts`.
- module `internal/` folders are private to that module.

Executable architecture checks live at the repo root:

```bash
pnpm boundaries
pnpm verify:architecture
```

`pnpm verify:architecture` runs dependency-cruiser plus filesystem/module-layout checks.

## Canonical Backend Request Flow

Every product/capability module follows this flow:

```text
HTTP handler -> Service/use-case Module -> Repository Interface -> Adapter
```

Responsibilities:

- **HTTP handler**: transport adapter only. It reads params/body/auth context, calls the service, and maps service/internal failures to the shared HTTP contract.
- **Service/use-case Module**: owns product behavior: ID generation, normalization, auth/scope/ownership rules, expected domain errors, repository coordination, and conversion to shared contract models.
- **Repository Interface**: storage-agnostic query port consumed by services. `repository.ts` owns repository input and record schemas.
- **Repository Adapter**: flat persistence implementation. It translates repository methods to memory/SQL operations and does not contain product logic.

Handlers must not call repositories directly. Repositories must not call HTTP code, construct shared response models, generate IDs, normalize product input, enforce domain authorization, sign tokens, hash passwords, or raise user-facing not-found/auth errors.

## Full-stack Module Layout

Product/domain/capability code uses `modules` consistently:

```text
packages/shared/src/modules/<module>/
apps/server/src/modules/<module>/
apps/webapp/src/modules/<module>/
```

Runtime/platform code stays outside `modules` under concrete top-level names such as `database`, `persistence`, `http`, `observability`, `layers`, and `test`.

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

## Server Module Layout

Server modules are flat by default:

- `handlers.ts`: transport adaptation only; calls services, not repositories.
- `service.ts`: service/use-case tag and interface.
- `service.live.ts`: live service implementation.
- `repository.ts`: repository interface plus repository input/record schemas.
- `repository.memory.ts`: in-memory implementation for domain/unit tests and ephemeral demos.
- `repository.sqlite.ts`: SQLite implementation using Effect SQL and `SqlSchema`.
- `repository.postgres.ts`: Postgres implementation using Effect SQL and `SqlSchema`.
- `*.test.ts`: module-specific tests.
- `index.ts`: public module API.

Server runtime/platform code remains in:

- `src/database` or `src/persistence`: persistence infrastructure, SQL clients, migrations/schema lifecycle, and transaction layers.
- `src/http`: HTTP server assembly and middleware.
- `src/observability`: tracing setup.
- `src/layers`: production layer composition.
- `src/test`: reusable test layers and integration/e2e test harnesses.

## Repository Policy

Repositories are strict query adapters.

Rules:

- `repository.ts` defines and exports `Schema` values and types for every repository input and record, using names such as `CreateTodoRepositoryInput` and `TodoRepositoryRecord`.
- Repository methods accept/return repository types, not HTTP DTOs or UI models.
- Memory, SQLite, and Postgres adapters implement the same repository interface.
- SQL adapters must use `SqlSchema` for every persistent operation, including writes that return no domain row.
- SQL queries should alias columns to match repository schemas directly.
- Repositories surface internal persistence errors; services/handlers decide whether those become expected domain errors or safe `InternalServerError` responses.
- Repositories never generate IDs. Creation services generate IDs before calling repositories.
- Repositories never contain product logic such as title normalization, ownership policy, password verification, JWT behavior, or client-visible not-found decisions.

## Persistence Policy

Canonical persistence adapters:

- `memory`: domain/unit tests and ephemeral demos.
- `sqlite`: local SQL development and programmatic e2e tests.
- `postgres`: production SQL.

JSON persistence is not canonical and must not be extended. Drizzle is not canonical and is scheduled for removal. Transitional JSON/Drizzle code may exist while the migration is in progress; do not copy it for new modules or new tests.

Persistence lifecycle is explicit infrastructure:

- runtime startup validates required configuration and schema/migration state;
- migrations/setup/reset live in database/persistence infrastructure, not request handlers;
- normal request handling must not silently create or mutate application schema;
- e2e tests reset/recreate the SQLite schema before each test.

## Error Policy

Errors are split into expected public errors and internal errors:

- Expected client-visible failures live in shared module `errors.ts` files and are declared in `api.ts` with explicit HTTP status/body contracts.
- Invalid route params/body payloads should fail contract decoding as 400-level input errors, not fall through to not-found behavior.
- Persistence errors are internal server concerns by default.
- Handlers map unexpected/persistence/internal failures to a shared safe `InternalServerError` contract.
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

Screens/components should not call the API client directly. Feature atoms own remote state, mutations, invalidation, and frontend use-case/state transitions. The base API client package must not own browser token lifecycle; the webapp adapter/atoms own browser storage, clearing, and UI reaction to auth failures.

## Product Module Checklist

When adding a persisted product module:

1. Define shared schemas, branded IDs, contracts, and expected errors.
2. Define repository inputs/records and the repository interface in `repository.ts`.
3. Implement the memory adapter for unit/domain tests.
4. Implement the SQLite adapter with `SqlSchema` for every operation.
5. Implement the Postgres adapter with `SqlSchema` for every operation.
6. Add/extend SQL migrations/schema lifecycle for SQLite and Postgres.
7. Add the service/use-case Module.
8. Add HTTP handlers that call the service only.
9. Add backend tests: domain/unit tests with memory and e2e tests through the typed client.
10. Add webapp atoms using the API client.
11. Add feature UI components.
12. Compose screens/routes/navigation.
13. Add observability spans/annotations around remote operations and important use cases.
14. Update docs.

## Migration Note

The current codebase may still contain transitional JSON persistence, Drizzle files, numeric IDs, handlers with direct repository access, or legacy test fixtures. The canonical policy in this document wins for new work. Migration sessions should remove the transitional code and update docs/tests as each layer is converted.
