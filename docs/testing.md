# Testing

## Current State

This template includes layered backend tests, one real HTTP integration test, and frontend component tests for storybookable React components.

The HTTP integration test lives in `apps/server/src/test/integration/http.test.ts` and demonstrates the preferred black-box flow:

1. start the real HTTP router on an ephemeral port
2. use a temporary SQLite database
3. create a typed `HttpApiClient` from the shared `Api`
4. authenticate through the real auth endpoint
5. call protected endpoints through the real HTTP boundary
6. assert on typed responses

## Recommended Testing Philosophy

Prefer the smallest test that exercises the behavior you care about:

- domain behavior: test module services with in-memory repository implementations from `apps/server/src/modules/<module>/repository.memory.ts`
- SQL mapping and constraints: test `repository.sql.ts` implementations with temporary SQLite
- transport behavior and end-to-end API flows: test the real HTTP server with `HttpApiClient`
- frontend component behavior: test presentational module components with Vitest and Testing Library
- visual states and component documentation: cover reusable UI in Storybook

Avoid duplicating the production client behind a separate SDK just for tests. Tests can use `HttpApiClient.make(Api)` directly so they stay aligned with the shared contract.

## Frontend Component Test Pattern

Webapp component tests live next to the components they exercise and use Vitest with Testing Library:

```bash
pnpm --filter @app/webapp test
```

Testing by layer:

- `modules/<module>/components/*`: props-first tests with callbacks and fixtures; no atoms/router/API.
- `components/screens/*`: prefer a `ScreenView` split when loading/error/empty/populated/pending states need direct coverage; keep connected screen tests integration-oriented.
- `src/router.tsx`: route wiring and redirects only, not component internals.
- `modules/<module>/atoms.ts`: test only non-trivial reactivity, error mapping, or transformation behavior.

Avoid adding a generic `renderWithAtoms` helper unless an integration test truly needs atom runtime wiring.

## HTTP Integration Test Pattern

Use `NodeHttpServer.layerTest` to run the server on an ephemeral port and provide an `HttpClient` that is already pointed at that server.

```ts
const TestApiLive = HttpRouter.serve(
  makeApiRoutesLayer(
    makeHttpServerDependenciesLayer(makeTestSqliteLayer({ seed: false })),
  ),
  { disableListenLog: true, disableLogger: true },
).pipe(Layer.provideMerge(NodeHttpServer.layerTest))
```

This keeps tests programmatic, typed, and close to the runtime behavior used by the webapp.

## Storybook Visual State Pattern

Storybook is configured for `apps/webapp`:

```bash
pnpm --filter @app/webapp storybook
pnpm --filter @app/webapp build-storybook
```

Use stories to document important states such as default, populated, empty, loading, error, pending, disabled, and parent-scoped variants. Stories must use mock props and must not call local or production APIs.

See [`docs/storybook.md`](./storybook.md) for the current catalog and guidance.
