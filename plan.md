# Plan

## Context

This template should be a clonable architectural reference for building real SaaS products with Effect. The goal is not to minimize files for the Todo example, but to establish strict patterns that agents can follow when turning the template into different products without degrading quality.

Agreed decisions:

- The template is **Effect-first**.
- Drizzle is not canonical and will be removed from the repo.
- Official persistence adapters are `memory`, `sqlite`, and `postgres`. JSON is removed completely.
- Repositories are flat query adapters.
- `repository.ts` defines the interface and runtime-validatable schemas for repository inputs/records.
- SQL adapters always use `SqlSchema`.
- HTTP handlers do not call repositories directly.
- Every product/capability module goes through a service/use-case Module.
- `AuthService` replaces the current auth logic in handlers and removes the need for `UsersService` for now.
- `TodosService` remains even if small, to teach the strict product-module pattern.
- Public and persisted IDs are branded UUID strings per entity.
- UUIDs are generated inline in creation services with `Random.nextUUIDv4`; repositories and custom `IdGenerator` services do not generate IDs.
- JWT `sub` is a validated `UserId` UUID.
- Expected errors are declared in shared contracts with explicit status/body definitions.
- `InternalServerError` is a shared public safe error for internal failures.
- Persistence errors are typed at the server/repository layer and handlers transform them into safe HTTP errors.
- Programmatic e2e tests use the real base client against a fetchable app, are Effect-native, use a temporary SQLite database per suite, and reset schema before each test.

## Layer impact matrix

```txt
- shared contract/API: yes
- backend persistence/repositories: yes
- backend domain services: yes
- HTTP/transport handlers: yes
- auth/scope/access policy: yes
- webapp atoms/state: yes
- webapp UI/screens/routes: maybe, only as needed for errors/IDs
- CLI/other clients: no current client, but api-client package enables future clients
- tests/fixtures: yes
- observability: yes, for persistence/auth/e2e error visibility
- docs: yes
```

## Target architecture

Backend request flow:

```txt
HTTP handler -> Service/use-case Module -> Repository Interface -> Adapter
```

Rules:

- **Handler**: transport adapter only. Reads params/body/auth context, calls the service, maps errors to the HTTP contract.
- **Service/use-case Module**: owns product behavior: ID generation, normalization, scope/ownership rules, domain errors, repository coordination, conversion to shared contract models.
- **Repository Interface**: owns repository records/inputs as `Schema` values and defines query-shaped methods.
- **Repository Adapter**: flat query implementation. No product logic. SQL adapters use `SqlSchema` for every persistent operation.
- **Persistence lifecycle**: setup/reset/migration/validation are explicit infrastructure concerns. The server must not silently mutate schema during request handling.

Frontend flow:

```txt
Screen/components -> feature atoms -> ApiClient
```

Rules:

- Screens/components do not call the API client directly.
- Atoms own remote state and mutations.
- `packages/api-client` provides a runtime-neutral typed API client.
- The webapp wraps the base client in a browser/React-friendly adapter/layer.

## PR / session breakdown

### 1. Docs and policy only

Purpose: establish canonical rules before code changes so future sessions/agents have a source of truth.

Files likely to modify:

- `docs/architecture.md`
- `docs/testing.md`
- `docs/api.md`
- `docs/development.md` if runtime/setup policy is mentioned
- `todo.md`
- possibly `AGENTS.md` if global agent guidance needs tightening

Content to add/update:

- Backend architecture rule: handler -> service -> repository -> adapter.
- Product module checklist for agents.
- Repository policy:
  - `repository.ts` owns `*RepositoryInput` and `*RepositoryRecord` schemas.
  - SQL adapters must use `SqlSchema` for all operations.
  - repositories generate no IDs and contain no product logic.
- Persistence policy:
  - official adapters: memory/sqlite/postgres.
  - JSON unsupported.
  - Drizzle not canonical and scheduled for removal.
- Error policy:
  - shared/domain errors for expected client-visible failures.
  - persistence errors are internal server errors unless mapped to domain errors.
  - common shared `InternalServerError`.
- Testing policy:
  - unit/domain tests use memory and may seed local memory state directly.
  - e2e tests use typed client + fetchable app + SQLite suite DB + reset schema before each test.
  - no global fixtures/seeds for e2e; test context is created through client/helpers.

Verification:

- Docs review only.
- No code checks required beyond formatting if docs are formatted by Biome.

Atomic commit:

- `docs: define canonical Effect SaaS architecture policies`

### 2. Shared contracts: UUID IDs and public errors

Purpose: make API/domain contracts reflect the final ID/error policy before backend rewrites.

Files likely to modify:

- `packages/shared/src/modules/users/schema.ts`
- `packages/shared/src/modules/todos/schema.ts`
- `packages/shared/src/modules/todos/api.ts`
- `packages/shared/src/modules/auth/api.ts`
- `packages/shared/src/modules/auth/contract.ts`
- `packages/shared/src/modules/*/errors.ts`
- `packages/shared/src/api.ts`
- new shared common error file, e.g. `packages/shared/src/errors.ts` or `packages/shared/src/modules/common/errors.ts`
- tests/docs impacted by changed IDs/errors

Tasks:

- Introduce branded UUID schemas:
  - `UserId`
  - `TodoId`
- Replace numeric IDs in shared user/todo schemas with UUID strings.
- Replace `Schema.NumberFromString` route params with UUID ID schemas.
- Define common `InternalServerError` with safe body.
- Ensure expected domain errors are shared and declared with explicit HTTP statuses:
  - `TodoNotFound` -> 404
  - auth/user errors as applicable, e.g. `UserAlreadyExists`, `InvalidCredentials`, `Unauthorized`
  - invalid params should decode as 400, not fall into not-found.
- Update API docs for the 400 vs 404 distinction.

Verification:

- `pnpm --filter @app/shared check`
- Any shared package tests if present.

Atomic commit:

- `shared: switch public ids to branded uuids and define common errors`

### 3. Persistence foundation: remove Drizzle and introduce Effect SQL lifecycle

Purpose: remove Drizzle as architectural gravity and establish common persistence errors/lifecycle.

Files likely to modify:

- `apps/server/package.json`
- `apps/server/src/database/*`
- remove `apps/server/src/database/schema.drizzle.ts`
- remove/replace `repository.drizzle.postgres.ts` imports/exports later in PR 4 if easier
- new `apps/server/src/persistence/errors.ts` or `apps/server/src/database/errors.ts`
- new/updated migration/schema lifecycle files
- docs/development/testing updates

Tasks:

- Remove `drizzle-orm` dependency and Drizzle-specific files/config.
- Add internal persistence errors:
  - `PersistenceSqlError`
  - `PersistenceDecodeError`
  - `PersistenceError`
  - helpers to map SQL/decode causes with operation names.
- Decide concrete lifecycle implementation:
  - prefer Effect SQL `Migrator` style for migrations/version tracking, or a small `DatabaseSchema` service if simpler;
  - runtime database layers validate expected schema/version and fail fast if mismatched;
  - test harness/setup can reset/recreate schema.
- Ensure SQLite/Postgres connection layers no longer silently create application tables as part of normal server startup unless explicitly in setup/test lifecycle.
- Keep PR focused on infrastructure; repository adapters can be completed in the next PR.

Verification:

- `pnpm --filter @app/server check`
- `pnpm --filter @app/server build`

Atomic commit:

- `server: replace drizzle persistence foundation with Effect SQL lifecycle`

### 4. Repository interfaces and adapters

Purpose: make repositories the strict query seam with schemas in `repository.ts` and `SqlSchema` adapters.

Files likely to modify:

- `apps/server/src/modules/users/repository.ts`
- `apps/server/src/modules/users/repository.memory.ts`
- rename/create `apps/server/src/modules/users/repository.sqlite.ts`
- rename/create `apps/server/src/modules/users/repository.postgres.ts`
- `apps/server/src/modules/todos/repository.ts`
- `apps/server/src/modules/todos/repository.memory.ts`
- rename/create `apps/server/src/modules/todos/repository.sqlite.ts`
- rename/create `apps/server/src/modules/todos/repository.postgres.ts`
- repository tests
- layer composition files

Repository policy to implement:

- `repository.ts` exports `Schema` values and types for every repository input/output:
  - `*RepositoryInput`
  - `*RepositoryRecord`
- Repository methods use those types.
- Memory, SQLite, and Postgres all implement the same interface.
- SQL adapters use `SqlSchema` for every operation, including void writes.
- SQL queries alias columns to match repository schemas directly.
- Repositories do not construct shared contract classes/models.
- Repositories do not generate IDs.
- Repositories do not do product logic such as not-found domain errors, title normalization, JWT logic, password verification, etc.

SQLite/Postgres considerations:

- IDs stored as UUID text.
- SQLite booleans may need SQL expressions or schema handling so repository record shape is boolean.
- Postgres implementation uses raw Effect SQL + `SqlSchema`, not Drizzle.
- Unique constraints and FKs remain in schema/migrations.

Verification:

- `pnpm --filter @app/server check`
- `pnpm --filter @app/server test` for repository/domain tests touched
- `pnpm --filter @app/server build`

Atomic commit:

- `server: define repository schemas and Effect SQL adapters`

### 5. Auth service and user persistence cleanup

Purpose: move auth behavior behind a real use-case service and remove shallow `UsersService`.

Files likely to modify:

- `apps/server/src/modules/auth/*`
- `apps/server/src/modules/users/service.*` remove or stop exporting
- `apps/server/src/modules/users/repository.ts`
- auth handlers
- auth tests
- layer composition

Tasks:

- Add/define `AuthService` as the auth use-case Module.
- `AuthService.register`:
  - normalize email;
  - pre-check `UsersRepository.getAuthByEmail`;
  - fail with `UserAlreadyExists` when needed;
  - generate `UserId` with `Random.nextUUIDv4` and decode/brand with `UserId`;
  - hash password;
  - create user via repository;
  - sign token with `sub = user.id`;
  - return shared auth session/contract.
- `AuthService.login`:
  - normalize email;
  - load auth record;
  - verify password;
  - fail with `InvalidCredentials` as an expected error;
  - sign token.
- `AuthService.currentSession` / session verification:
  - verify JWT;
  - decode `sub` as `UserId`;
  - load user;
  - return public session user or `Unauthorized`.
- Remove `UsersService` unless a non-auth user use case exists.
- Handlers call `AuthService`, not repositories/password/token services directly.
- Handlers map `PersistenceError` to `InternalServerError` and expected auth errors to shared contract errors.

Verification:

- `pnpm --filter @app/server check`
- `pnpm --filter @app/server test`
- `pnpm --filter @app/server build`
- `pnpm --filter @app/shared check`

Atomic commit:

- `server: introduce AuthService and remove shallow UsersService`

### 6. Todos service and thin handlers

Purpose: enforce the same product-module pattern for Todos.

Files likely to modify:

- `apps/server/src/modules/todos/service.ts`
- `apps/server/src/modules/todos/service.live.ts`
- `apps/server/src/modules/todos/handlers.ts`
- todo tests
- layer composition

Tasks:

- Keep/reshape `TodosService` as use-case Module.
- `TodosService.listForUser`:
  - calls repository;
  - converts `TodoRepositoryRecord` to shared `Todo`.
- `TodosService.createForUser`:
  - receives authenticated `UserId` and title;
  - generates `TodoId` inline with `Random.nextUUIDv4` and ID schema decode;
  - normalizes title if required by product policy;
  - calls repository with full record/input;
  - returns shared `Todo`.
- `TodosService.updateCompletedForUser`:
  - enforces user scope via repository method;
  - turns missing/no update into `TodoNotFound`;
  - returns void or updated shared model depending on contract.
- Handlers:
  - decode params/body/auth context;
  - call `TodosService` only;
  - no repository calls;
  - map `PersistenceError` -> `InternalServerError`;
  - remove no-op `catchTag(... Effect.fail(error))` blocks.

Verification:

- `pnpm --filter @app/server check`
- `pnpm --filter @app/server test`
- `pnpm --filter @app/server build`
- `pnpm --filter @app/shared check`

Atomic commit:

- `server: route todo use cases through TodosService`

### 7. API client package and fetchable app e2e harness

Purpose: create the canonical programmatic e2e pattern inspired by opencode but Effect-native.

Files likely to modify:

- new `packages/api-client/*`
- `pnpm-workspace.yaml`
- root/package scripts if needed
- `apps/webapp/src/api/client.ts`
- server app/listener files, e.g. `apps/server/src/http/server.ts` or equivalent
- `apps/server/src/test/integration/*`
- test layers/harness files
- `docs/testing.md`

API client policy:

- `packages/api-client` builds the typed client from shared `Api`.
- Public interface includes both a function and a Layer/service:
  - `makeApiClient(options)`
  - `makeApiClientLayer(options)` / `ApiClient` service
- Options:
  - `apiUrl`
  - optional injected `fetch`
  - optional `getAuthToken: Effect.Effect<string | null>`
- Client only prepends the base URL and injects a Bearer token.
- Client does not validate tokens, clear tokens, refresh tokens, or react to 401s.
- Webapp has a convenience adapter/layer that reads browser auth storage; feature atoms should not deal with test refs or client construction.

Fetchable app policy:

- Separate app fetchable from listener:
  - app has `fetch(request)` and `request(input, init)`;
  - listener opens a real network port only for transport-level tests/runtime.
- Programmatic e2e default uses `fetch: app.fetch` and `apiUrl: "http://test"`.
- Use ephemeral ports only for transport behavior tests.

E2E policy:

- Tests use `@effect/vitest` and `Effect.gen`.
- One fetchable SQLite server app per suite/file is acceptable.
- SQLite DB is temporary for the suite.
- Before each test, reset/recreate schema to empty.
- Tests create context through the public typed client/helpers, not DB seeds.
- Auth token state in tests can be a local `Ref<string | null>` passed to `getAuthToken`.

Verification:

- `pnpm --filter @app/server check`
- `pnpm --filter @app/server test`
- `pnpm --filter @app/server build`
- `pnpm --filter @app/webapp check` if webapp client adapter changes
- `pnpm --filter @app/shared check`

Atomic commit:

- `test: add Effect-native typed-client e2e harness`

### 8. Webapp migration

Purpose: update webapp to new contracts/client while preserving frontend architecture.

Files likely to modify:

- `apps/webapp/src/api/client.ts`
- `apps/webapp/src/modules/auth/atoms.ts`
- `apps/webapp/src/modules/todos/atoms.ts`
- UI/components only if ID/error shape changes require it
- webapp tests/stories if present

Tasks:

- Replace local client construction with `packages/api-client` wrapper/layer.
- Keep browser token lifecycle in webapp auth storage/atoms, not the base client.
- Update atoms for UUID IDs and new errors.
- Ensure screens/components still consume atoms, not the API client directly.
- Render expected auth/todo errors explicitly where appropriate.

Verification:

- `pnpm --filter @app/webapp check`
- `pnpm --filter @app/webapp build`
- relevant webapp tests/stories if present

Atomic commit:

- `webapp: consume shared api-client and uuid contracts`

### 9. Final cleanup and verification

Purpose: remove leftover transitional patterns and make docs/TODOs match implementation.

Files likely to modify:

- `todo.md`
- `docs/*`
- package lockfile
- scripts/config examples
- stale repository/test files

Tasks:

- Remove all Drizzle leftovers.
- Remove JSON persistence leftovers.
- Remove stale TODOs resolved by the refactor.
- Update `.env.example` and development docs for SQLite/Postgres setup/validation commands.
- Ensure architecture docs match actual file names.
- Ensure no handlers import repositories directly.
- Ensure no SQL adapters bypass `SqlSchema`.
- Ensure no repository generates IDs.

Verification:

- `pnpm check`
- `pnpm build`
- `pnpm lint`
- `pnpm --filter @app/server test`
- relevant e2e command once added

Atomic commit:

- `chore: clean up persistence architecture migration`

## Agent product-module checklist

When adding a persisted product module, agents should follow this order:

1. Define shared schemas, branded IDs, contracts, and expected errors.
2. Define repository inputs/records and interface in `repository.ts`.
3. Implement the memory adapter for unit/domain tests.
4. Implement the SQLite adapter with `SqlSchema` for every operation.
5. Implement the Postgres adapter with `SqlSchema` for every operation.
6. Add/extend migrations/schema lifecycle for SQLite and Postgres.
7. Add the service/use-case Module.
8. Add HTTP handlers that call the service only.
9. Add backend tests:
   - unit/domain tests with memory;
   - programmatic e2e tests through typed client for user-facing flows.
10. Add webapp atoms using the API client.
11. Add UI/screens/routes.
12. Add observability spans/annotations around remote operations and important use cases.
13. Update docs.

## Open implementation decisions for future sessions

These are intentionally left for implementation sessions to resolve with code context:

- Exact file names for persistence lifecycle: `database/*` vs `persistence/*`.
- Whether to use Effect SQL `Migrator` directly or a small `DatabaseSchema` service wrapping it.
- Exact shape of `InternalServerError` and whether the API root can apply it globally or each endpoint must add it.
- Exact reset implementation for e2e SQLite suite DB: drop/recreate via migrator/schema lifecycle.
- Exact Postgres migration/validation command names.
- Whether to preserve any existing SQLite raw SQL temporarily during the PR 3/4 split.

## Validation strategy by phase

- Docs-only phase: review rendered docs; no runtime validation required.
- Shared contract phase: `pnpm --filter @app/shared check`.
- Backend phases: `pnpm --filter @app/server check`, `pnpm --filter @app/server test`, `pnpm --filter @app/server build`, `pnpm --filter @app/shared check`.
- Webapp phase: `pnpm --filter @app/webapp check`, `pnpm --filter @app/webapp build`.
- Final phase: `pnpm check`, `pnpm build`, `pnpm lint`, server tests, e2e command.
