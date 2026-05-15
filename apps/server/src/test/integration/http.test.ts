import { Api, Authorization, CreateTodoInput, RegisterInput } from "@app/shared"
import { NodeHttpServer } from "@effect/platform-node"
import { assert, describe, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer } from "effect"
import { HttpClientRequest, HttpRouter } from "effect/unstable/http"
import { HttpApiClient, HttpApiMiddleware } from "effect/unstable/httpapi"
import { makeApiRoutesLayer } from "../../http/server"
import { makeHttpServerDependenciesLayer } from "../../layers/ServerLayers"
import { makeTestSqliteLayer } from "../layers/TestSqliteLayer"

const testConfigProvider = ConfigProvider.fromUnknown({
  AUTH_JWT_SECRET: "integration-test-secret-at-least-32-chars",
  AUTH_JWT_ISSUER: "app-test",
  AUTH_JWT_AUDIENCE: "app-test",
})

const makeAuthorizationClientLayer = (token?: string) =>
  HttpApiMiddleware.layerClient(
    Authorization,
    Effect.fn(function* ({ next, request }) {
      return yield* next(
        token === undefined
          ? request
          : HttpClientRequest.bearerToken(request, token),
      )
    }),
  )

const TestApiLive = HttpRouter.serve(
  makeApiRoutesLayer(
    makeHttpServerDependenciesLayer(makeTestSqliteLayer({ seed: false })),
  ),
  { disableListenLog: true, disableLogger: true },
).pipe(Layer.provideMerge(NodeHttpServer.layerTest))

describe("HTTP integration", () => {
  it.effect("creates a todo through the typed HTTP client and lists it", () =>
    Effect.gen(function* () {
      const anonymousClient = yield* HttpApiClient.make(Api).pipe(
        Effect.provide(makeAuthorizationClientLayer()),
      )

      const session = yield* anonymousClient.auth.register({
        payload: new RegisterInput({
          name: "Integration Tester",
          email: "integration@example.com",
          password: "correct horse battery staple",
        }),
      })

      const client = yield* HttpApiClient.make(Api).pipe(
        Effect.provide(makeAuthorizationClientLayer(session.token)),
      )

      const before = yield* client.todos.list()
      const created = yield* client.todos.create({
        payload: new CreateTodoInput({
          title: "Exercise typed HTTP integration tests",
        }),
      })
      const after = yield* client.todos.list()

      assert.strictEqual(before.length, 0)
      assert.deepInclude([...after], created)
    }).pipe(
      Effect.provide(TestApiLive),
      Effect.provideService(ConfigProvider.ConfigProvider, testConfigProvider),
    ),
  )
})
