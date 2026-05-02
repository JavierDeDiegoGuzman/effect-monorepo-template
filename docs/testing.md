# Testing

## Current State

This template includes layered backend tests and one real HTTP integration test.

The HTTP integration test lives in `apps/server/src/http/HttpIntegration.test.ts` and demonstrates the preferred black-box flow:

1. start the real HTTP router on an ephemeral port
2. use a temporary SQLite database
3. create a typed `HttpApiClient` from the shared `Api`
4. authenticate through the real auth endpoint
5. call protected todos endpoints through the real HTTP boundary
6. assert on typed responses

## Recommended Testing Philosophy

Prefer the smallest test that exercises the behavior you care about:

- domain behavior: test services with in-memory repositories
- SQL mapping and constraints: test repositories with temporary SQLite
- transport behavior and end-to-end API flows: test the real HTTP server with `HttpApiClient`

Avoid duplicating the production client behind a separate SDK just for tests. Tests can use `HttpApiClient.make(Api)` directly so they stay aligned with the shared contract.

## HTTP Integration Test Pattern

Use `NodeHttpServer.layerTest` to run the server on an ephemeral port and provide an `HttpClient` that is already pointed at that server.

The canonical shape is:

```ts
const TestApiLive = HttpRouter.serve(
  makeApiRoutesLayer(
    makeHttpServerDependenciesLayer(makeTestSqliteLayer({ seed: false })),
  ),
  { disableListenLog: true, disableLogger: true },
).pipe(Layer.provideMerge(NodeHttpServer.layerTest))

const program = Effect.gen(function* () {
  const client = yield* HttpApiClient.make(Api)
  const session = yield* client.auth.register({ payload })
  const authedClient = yield* HttpApiClient.make(Api).pipe(
    Effect.provide(makeAuthorizationClientLayer(session.token)),
  )

  const before = yield* authedClient.todos.list()
  const created = yield* authedClient.todos.create({ payload: todoInput })
  const after = yield* authedClient.todos.list()

  expect(after).toContainEqual(created)
}).pipe(Effect.provide(TestApiLive))
```

This keeps tests programmatic, typed, and close to the runtime behavior used by the webapp.

## Why This Matters

The shared API definition is the contract between server and clients. Running integration tests through `HttpApiClient` catches route, middleware, schema, auth, and persistence wiring issues without introducing another client abstraction to maintain.
