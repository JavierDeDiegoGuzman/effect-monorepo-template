import { Api, CreateTodoInput, RegisterInput } from "@app/shared"
import { NodeHttpServer } from "@effect/platform-node"
import { assert, describe, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer, Ref } from "effect"
import { FetchHttpClient, HttpRouter } from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"
import { makeApiRoutesLayer } from "../../http/server"
import { makeHttpServerDependenciesLayer } from "../../layers/ServerLayers"
import { makeSqlRepositoriesTestLayer } from "../layers/SqlRepositoriesTestLayer"

const testConfigProvider = ConfigProvider.fromUnknown({
  AUTH_JWT_SECRET: "integration-test-secret-at-least-32-chars",
  AUTH_JWT_ISSUER: "app-test",
  AUTH_JWT_AUDIENCE: "app-test",
  AUTH_SESSION_COOKIE_SECURE: false,
})

const makeCookieJarFetch = (cookieRef: Ref.Ref<string | null>): typeof fetch =>
  (async (input, init) => {
    const headers = new Headers(init?.headers)
    headers.delete("content-length")

    const cookie = await Effect.runPromise(Ref.get(cookieRef))
    if (cookie !== null) {
      headers.set("cookie", cookie)
    }

    const response = await fetch(input, { ...init, headers })
    const setCookie = response.headers.get("set-cookie")
    if (setCookie !== null) {
      await Effect.runPromise(
        Ref.set(cookieRef, setCookie.split(";")[0] ?? null),
      )
    }
    return response
  }) as typeof fetch

const TestApiLive = HttpRouter.serve(
  makeApiRoutesLayer(
    makeHttpServerDependenciesLayer(
      makeSqlRepositoriesTestLayer({ seed: false }),
    ),
  ),
  { disableListenLog: true, disableLogger: true },
).pipe(Layer.provideMerge(NodeHttpServer.layerTest))

describe("HTTP integration", () => {
  it.effect("creates a todo through the typed HTTP client and lists it", () =>
    Effect.gen(function* () {
      const client = yield* HttpApiClient.make(Api)

      yield* client.auth.register({
        payload: new RegisterInput({
          name: "Integration Tester",
          email: "integration@example.com",
          password: "correct horse battery staple",
        }),
      })

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
      Effect.provideServiceEffect(
        FetchHttpClient.Fetch,
        Ref.make<string | null>(null).pipe(Effect.map(makeCookieJarFetch)),
      ),
      Effect.provideService(ConfigProvider.ConfigProvider, testConfigProvider),
    ),
  )
})
