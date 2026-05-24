import {
  Api,
  CreateTodoInput,
  makeTodoId,
  RegisterInput,
  UpdateTodoInput,
} from "@app/shared"
import { assert, describe, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer, Ref } from "effect"
import { FetchHttpClient, HttpRouter } from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"
import { makeApiRoutesLayer } from "../../http/server"
import { makeHttpServerDependenciesLayer } from "../../layers/ServerLayers"
import { makeSqlRepositoriesTestLayer } from "../layers/SqlRepositoriesTestLayer"

const smokeConfigProvider = ConfigProvider.fromUnknown({
  AUTH_JWT_SECRET: "smoke-test-secret-at-least-32-chars",
  AUTH_JWT_ISSUER: "app-smoke-test",
  AUTH_JWT_AUDIENCE: "app-smoke-test",
  AUTH_SESSION_COOKIE_SECURE: false,
})

const makeSmokeApiLayer = () =>
  makeApiRoutesLayer(
    makeHttpServerDependenciesLayer(
      makeSqlRepositoriesTestLayer({ seed: false }),
    ),
  ).pipe(Layer.provide(ConfigProvider.layer(smokeConfigProvider)))

type WebHandler = (request: Request, context?: never) => Promise<Response>

const makeCookieJarFetch = (
  handler: WebHandler,
  cookieRef: Ref.Ref<string | null>,
): typeof fetch =>
  (async (input, init) => {
    const request = new Request(input, init)
    const headers = new Headers(request.headers)
    headers.delete("content-length")

    const cookie = await Effect.runPromise(Ref.get(cookieRef))
    if (cookie !== null) headers.set("cookie", cookie)

    const response = await handler(new Request(request, { headers }))
    const setCookie = response.headers.get("set-cookie")
    if (setCookie !== null) {
      await Effect.runPromise(
        Ref.set(cookieRef, setCookie.split(";")[0] ?? null),
      )
    }

    return response
  }) as typeof fetch

const withSmokeApi = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.gen(function* () {
    const cookieRef = yield* Ref.make<string | null>(null)
    const routesLayer =
      makeSmokeApiLayer() as Layer.Layer<HttpRouter.HttpRouter>
    const { dispose, handler } = HttpRouter.toWebHandler(routesLayer, {
      disableLogger: true,
    })

    return yield* effect.pipe(
      Effect.provide(FetchHttpClient.layer),
      Effect.provideService(
        FetchHttpClient.Fetch,
        makeCookieJarFetch(handler, cookieRef),
      ),
      Effect.ensuring(Effect.promise(dispose)),
    )
  })

const register = (client: HttpApiClient.ForApi<typeof Api>, email: string) =>
  client.auth.register({
    payload: new RegisterInput({
      name: "Smoke Tester",
      email,
      password: "correct horse battery staple",
    }),
  })

const assertPublicError = (
  error: unknown,
  expected: { readonly tag: string; readonly message: string },
) => {
  assert.strictEqual((error as { readonly _tag?: string })._tag, expected.tag)
  assert.strictEqual(
    (error as { readonly message?: string }).message,
    expected.message,
  )
}

const assertUnauthorized = (error: unknown) => {
  assertPublicError(error, {
    tag: "Unauthorized",
    message: "Authentication required",
  })
}

const assertUserAlreadyExists = (error: unknown, expectedEmail: string) => {
  assertPublicError(error, {
    tag: "UserAlreadyExists",
    message: "User already exists",
  })
  assert.strictEqual(
    (error as { readonly email?: string }).email,
    expectedEmail,
  )
}

const assertTodoNotFound = (error: unknown, expectedId: unknown) => {
  assertPublicError(error, {
    tag: "TodoNotFound",
    message: "Todo not found",
  })
  assert.strictEqual((error as { readonly id?: unknown }).id, expectedId)
}

describe("HTTP smoke flows", () => {
  it.effect(
    "runs auth and todo flows through an in-process HTTP client without network",
    () =>
      withSmokeApi(
        Effect.gen(function* () {
          const client = yield* HttpApiClient.make(Api, {
            baseUrl: "http://app.test",
          })

          const unauthenticated = yield* client.session.me().pipe(Effect.flip)
          assertUnauthorized(unauthenticated)

          const session = yield* register(client, "smoke@example.com")
          assert.strictEqual(session.user.email, "smoke@example.com")

          const currentSession = yield* client.session.me()
          assert.strictEqual(currentSession.user.email, "smoke@example.com")

          const before = yield* client.todos.list()
          assert.deepStrictEqual(before, [])

          const first = yield* client.todos.create({
            payload: new CreateTodoInput({ title: "Write smoke test" }),
          })
          assert.strictEqual(first.title, "Write smoke test")
          assert.strictEqual(first.completed, false)

          const firstChecked = yield* client.todos.update({
            params: { id: first.id },
            payload: new UpdateTodoInput({ completed: true }),
          })
          assert.strictEqual(firstChecked.completed, true)

          const firstReadBack = yield* client.todos.getById({
            params: { id: first.id },
          })
          assert.strictEqual(firstReadBack.completed, true)

          const second = yield* client.todos.create({
            payload: new CreateTodoInput({ title: "Review smoke results" }),
          })
          const afterCreate = yield* client.todos.list()
          assert.deepStrictEqual(
            afterCreate.map((todo) => todo.id).sort(),
            [first.id, second.id].sort(),
          )

          const secondChecked = yield* client.todos.update({
            params: { id: second.id },
            payload: new UpdateTodoInput({ completed: true }),
          })
          assert.strictEqual(secondChecked.completed, true)

          const duplicate = yield* register(client, " SMOKE@example.com ").pipe(
            Effect.flip,
          )
          assertUserAlreadyExists(duplicate, "smoke@example.com")

          const missingTodoId = makeTodoId(
            "00000000-0000-4000-8000-000000000999",
          )
          const missing = yield* client.todos
            .getById({ params: { id: missingTodoId } })
            .pipe(Effect.flip)
          assertTodoNotFound(missing, missingTodoId)

          const logout = yield* client.auth.logout()
          assert.strictEqual(logout.success, true)

          const afterLogout = yield* client.session.me().pipe(Effect.flip)
          assertUnauthorized(afterLogout)
        }),
      ),
  )
})
