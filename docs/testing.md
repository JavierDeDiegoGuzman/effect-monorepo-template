# Testing

## Goals

Testing should prove the architecture without bypassing it. Prefer the smallest test that exercises the behavior you care about, but keep user-facing flows black-box through the typed API client.

Canonical test layers:

- domain/use-case tests: service layer with memory repositories;
- repository adapter tests: adapter-specific behavior and schema/constraint mapping;
- e2e API tests: typed client against an in-process HTTP app with a temporary SQLite database;
- frontend component tests: props-first component tests and Storybook visual states.

Server test layers under `apps/server/src/test/layers/*` are thin test-facing adapters around the canonical composition helpers in `apps/server/src/layers/ServerLayers.ts`. Reuse those helpers instead of duplicating module/service lists in tests.

## Test Layer Composition

- Use `makeInMemoryRepositoriesLayer(seed)` for fast domain tests with seeded users, credentials, or todos.
- Use `makeSqliteRepositoryLayer(makeTestSqliteLayer(...))` through `makeSqlRepositoriesTestLayer(...)` for SQL-backed repository and e2e tests. `makeTestSqliteLayer` runs the shared migration runner by default and only seeds when explicitly requested.
- Use `makeProductDomainLayer(...)` for product domain tests that only need product services such as Users and Todos.
- Use full HTTP dependencies through `makeHttpServerDependenciesLayer(...)` for in-process e2e/smoke tests that exercise auth/session middleware and handlers.
- Do not assemble `UsersLive`, `TodosLive`, auth credentials, transactions, and repository adapters ad hoc in individual tests.

## Domain and Service Tests

Use module services with in-memory repository implementations from `apps/server/src/modules/<module>/repository.memory.ts` for domain/use-case behavior.

Domain tests may seed local memory repository state directly because the test target is the service behavior, not the HTTP contract. They should still call the service/use-case API, not repository methods, for the behavior under test.

Good targets for domain tests:

- ID generation and schema branding after UUID creation;
- input normalization;
- auth/scope/ownership decisions;
- mapping missing repository results to expected domain errors;
- coordination across repositories;
- conversion from repository records to shared contract models.

## Repository Adapter Tests

Repository adapters are flat query adapters and should be tested for persistence mapping, constraints, and decode behavior.

Canonical adapters:

- `repository.memory.ts` for memory semantics used by service tests;
- `repository.sql.ts` for SQLite SQL behavior;
- `repository.postgres.ts` for Postgres SQL behavior.

SQL repository tests should verify that operations go through `SqlSchema` and decode rows into repository record schemas defined in `repository.ts`. They should also cover persistence mapping, read-back behavior, and internal error mapping through shared SQL repository helpers where applicable. SQL failures and decode failures should surface as internal persistence errors, not public API errors. Transaction rollback behavior is verified against SQL adapters; the memory transaction adapter is a no-op intended for fast domain tests, not rollback simulation.

JSON and Drizzle adapters are not part of the product/runtime template and should not receive new coverage.

## Programmatic E2E API Tests

The canonical e2e pattern is Effect-native and programmatic:

1. Build the real HTTP route layer in-process without opening a network listener.
2. Use a temporary SQLite database per suite/file.
3. Run the shared Effect SQL migration runner for that temporary database before using repositories.
4. Convert the route layer to a web `Request -> Response` handler with `HttpRouter.toWebHandler(...)` when the test should avoid TCP entirely.
5. Create a typed API client from the shared API contract.
6. Inject a local `FetchHttpClient.Fetch` implementation that calls the web handler directly, using a placeholder base URL such as `http://app.test`.
7. Create user/application context through public client calls and helpers, not global DB seeds.
8. Store session cookie state in test-local state, for example a `Ref<string | null>` used by the injected fetch implementation.

E2E tests should exercise the public contract:

- register/login through auth endpoints;
- call protected endpoints through the session cookie;
- assert typed success responses;
- assert expected shared errors and HTTP status behavior;
- assert UI-manageable failures as shared typed contract errors with fixed public messages, not generic `Error`, string failures, ad-hoc failures, or defects;
- assert repository/operational failures through the HTTP mapping seam as safe `InternalServerError` responses when they are intentionally simulated;
- assert invalid params/body decode as built-in 400-level input failures rather than generic not-found behavior.

A real network listener with an ephemeral port is reserved for transport-specific behavior tests, not the default e2e path.

## Migration Tests

Database migration tests target `apps/server/src/database/migrations.ts` directly with a temporary SQLite layer.

Use `makeTestSqliteLayer({ migrate: false })` when the test needs to start from an empty database and call `runMigrations()` or `runMigrations({ toMigrationInclusive: n })` manually. Assert migration rows through `effect_sql_migrations` and inspect SQLite catalog tables such as `PRAGMA table_info(...)` or `PRAGMA index_list(...)` for schema behavior.

Seed behavior is tested separately through `seedDemoData`; schema migrations must not depend on demo fixtures.

## Typed Client Policy

The typed client is created from `packages/shared` API contracts at the runtime boundary. This template intentionally does not include a separate API client package.

Client setup should include:

- a base URL or placeholder URL used for request construction;
- optional injected `fetch`/`FetchHttpClient.Fetch`.

The client layer must not validate tokens, clear storage, refresh sessions, or own browser lifecycle behavior; browser/web tests provide cookie credentials behavior at the runtime adapter.

## HTTP Integration and Smoke Tests

HTTP integration tests should target the in-process HTTP app + typed client + temporary SQLite pattern described above. `pnpm smoke:server` runs the no-network smoke suite under `apps/server/src/test/smoke`, driving auth and todo flows through the typed client and a local fetch implementation that calls `HttpRouter.toWebHandler(...)` directly.

## Frontend Component Test Pattern

Webapp component tests live next to the components they exercise and use Vitest with Testing Library:

```bash
pnpm --filter @app/webapp test
```

Testing by layer:

- `modules/<module>/components/*`: props-first tests with callbacks and fixtures; no atoms/router/API.
- `components/screens/*`: prefer a `ScreenView` split when loading/error/empty/populated/pending states need direct coverage; keep connected screen tests integration-oriented.
- `src/router.tsx`: route wiring and redirects only, not component internals.
- `modules/<module>/atoms.ts`: test only non-trivial reactivity, error mapping, invalidation, or transformation behavior.

Avoid adding a generic `renderWithAtoms` helper unless an integration test truly needs atom runtime wiring.

## Storybook Visual State Pattern

Storybook is configured for `apps/webapp`:

```bash
pnpm --filter @app/webapp storybook
pnpm --filter @app/webapp build-storybook
```

Use stories to document important states such as default, populated, empty, loading, error, pending, disabled, and parent-scoped variants. Stories must use mock props and must not call local or production APIs.

See [`docs/storybook.md`](./storybook.md) for the current catalog and guidance.
