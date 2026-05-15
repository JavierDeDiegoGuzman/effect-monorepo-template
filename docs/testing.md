# Testing

## Goals

Testing should prove the architecture without bypassing it. Prefer the smallest test that exercises the behavior you care about, but keep user-facing flows black-box through the typed API client.

Canonical test layers:

- domain/use-case tests: service layer with memory repositories;
- repository adapter tests: adapter-specific behavior and schema/constraint mapping;
- e2e API tests: typed client against a fetchable app with a temporary SQLite database;
- frontend component tests: props-first component tests and Storybook visual states.

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
- `repository.sqlite.ts` for SQLite SQL behavior;
- `repository.postgres.ts` for Postgres SQL behavior.

SQL repository tests should verify that operations go through `SqlSchema` and decode rows into repository record schemas defined in `repository.ts`. SQL failures and decode failures should surface as internal persistence errors, not public API errors.

JSON and Drizzle adapters are transitional legacy code during the migration and should not receive new coverage except where needed to safely remove them.

## Programmatic E2E API Tests

The canonical e2e pattern is Effect-native and programmatic:

1. Build the real HTTP app as a fetchable application without opening a network listener.
2. Use a temporary SQLite database per suite/file.
3. Reset or recreate schema before each test.
4. Create a typed API client from the shared API contract.
5. Pass the app's `fetch` implementation into the client with an `apiUrl` such as `http://test`.
6. Create user/application context through public client calls and helpers, not global DB seeds.
7. Store auth token state in test-local state, for example a `Ref<string | null>` passed to the client `getAuthToken` effect.

E2E tests should exercise the public contract:

- register/login through auth endpoints;
- call protected endpoints through Bearer auth;
- assert typed success responses;
- assert expected shared errors and HTTP status behavior;
- assert invalid params/body decode as 400-level input failures rather than generic not-found behavior.

A real network listener with an ephemeral port is reserved for transport-specific behavior tests, not the default e2e path.

## Typed Client Policy

The canonical API client lives in `packages/api-client` and is built from `packages/shared` API contracts.

Client options should include:

- `apiUrl`;
- optional injected `fetch`;
- optional `getAuthToken: Effect.Effect<string | null>`.

The base client only prepends the base URL and injects a Bearer token when available. It must not validate tokens, clear storage, refresh sessions, or own browser lifecycle behavior.

## HTTP Integration Tests During Migration

Some existing tests may still start the real HTTP router on an ephemeral port and use transitional JSON persistence. That pattern is legacy during the migration. New e2e tests should target the fetchable app + typed client + temporary SQLite pattern described above.

If a temporary legacy test remains necessary while refactoring, keep it isolated and remove it when the canonical e2e harness covers the same behavior.

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
