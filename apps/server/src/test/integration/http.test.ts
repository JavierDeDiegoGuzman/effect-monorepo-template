import {
  Api,
  CreateTodoInput,
  LoginInput,
  makeTodoId,
  RegisterInput,
  UpdateTodoInput,
} from "@app/shared"
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

const withTestApi = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.provide(TestApiLive),
    Effect.provideService(ConfigProvider.ConfigProvider, testConfigProvider),
  )

const withCookieJar = <A, E, R>(
  cookieRef: Ref.Ref<string | null>,
  effect: Effect.Effect<A, E, R>,
) =>
  effect.pipe(
    Effect.provideService(FetchHttpClient.Fetch, makeCookieJarFetch(cookieRef)),
  )

const register = (client: HttpApiClient.ForApi<typeof Api>, email: string) =>
  client.auth.register({
    payload: new RegisterInput({
      name: "Integration Tester",
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

const missingTodoId = makeTodoId("00000000-0000-4000-8000-000000000999")

const assertTodoNotFound = (error: unknown, expectedId: unknown) => {
  assertPublicError(error, {
    tag: "TodoNotFound",
    message: "Todo not found",
  })
  assert.strictEqual((error as { readonly id?: number }).id, expectedId)
}

const assertUnauthorized = (error: unknown) => {
  assertPublicError(error, {
    tag: "Unauthorized",
    message: "Authentication required",
  })
}

const assertInvalidCredentials = (error: unknown) => {
  assertPublicError(error, {
    tag: "InvalidCredentials",
    message: "Invalid email or password",
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

describe("HTTP integration", () => {
  it.effect("creates a todo through the typed HTTP client and lists it", () =>
    withTestApi(
      Effect.gen(function* () {
        const cookieRef = yield* Ref.make<string | null>(null)
        const client = yield* HttpApiClient.make(Api)

        yield* withCookieJar(
          cookieRef,
          register(client, "integration@example.com"),
        )

        const before = yield* withCookieJar(cookieRef, client.todos.list())
        const created = yield* withCookieJar(
          cookieRef,
          client.todos.create({
            payload: new CreateTodoInput({
              title: "Exercise typed HTTP integration tests",
            }),
          }),
        )
        const after = yield* withCookieJar(cookieRef, client.todos.list())

        assert.strictEqual(before.length, 0)
        assert.deepInclude([...after], created)
      }),
    ),
  )

  it.effect("returns TodoNotFound for a missing todo", () =>
    withTestApi(
      Effect.gen(function* () {
        const cookieRef = yield* Ref.make<string | null>(null)
        const client = yield* HttpApiClient.make(Api)

        yield* withCookieJar(
          cookieRef,
          register(client, "missing-todo@example.com"),
        )

        const getError = yield* withCookieJar(
          cookieRef,
          client.todos
            .getById({ params: { id: missingTodoId } })
            .pipe(Effect.flip),
        )
        const updateError = yield* withCookieJar(
          cookieRef,
          client.todos
            .update({
              params: { id: missingTodoId },
              payload: new UpdateTodoInput({ completed: true }),
            })
            .pipe(Effect.flip),
        )

        assertTodoNotFound(getError, missingTodoId)
        assertTodoNotFound(updateError, missingTodoId)
      }),
    ),
  )

  it.effect("returns TodoNotFound instead of leaking another user's todo", () =>
    withTestApi(
      Effect.gen(function* () {
        const aliceCookies = yield* Ref.make<string | null>(null)
        const bobCookies = yield* Ref.make<string | null>(null)
        const client = yield* HttpApiClient.make(Api)

        yield* withCookieJar(
          aliceCookies,
          register(client, "alice@example.com"),
        )
        const aliceTodo = yield* withCookieJar(
          aliceCookies,
          client.todos.create({
            payload: new CreateTodoInput({
              title: "Alice private todo",
            }),
          }),
        )

        yield* withCookieJar(bobCookies, register(client, "bob@example.com"))

        const getError = yield* withCookieJar(
          bobCookies,
          client.todos
            .getById({ params: { id: aliceTodo.id } })
            .pipe(Effect.flip),
        )
        const updateError = yield* withCookieJar(
          bobCookies,
          client.todos
            .update({
              params: { id: aliceTodo.id },
              payload: new UpdateTodoInput({ completed: true }),
            })
            .pipe(Effect.flip),
        )
        const unchanged = yield* withCookieJar(
          aliceCookies,
          client.todos.getById({
            params: { id: aliceTodo.id },
          }),
        )

        assertTodoNotFound(getError, aliceTodo.id)
        assertTodoNotFound(updateError, aliceTodo.id)
        assert.strictEqual(unchanged.completed, false)
      }),
    ),
  )

  it.effect(
    "returns Unauthorized for protected endpoints without a session",
    () =>
      withTestApi(
        Effect.gen(function* () {
          const cookieRef = yield* Ref.make<string | null>(null)
          const client = yield* HttpApiClient.make(Api)

          const meError = yield* withCookieJar(
            cookieRef,
            client.session.me().pipe(Effect.flip),
          )
          const listError = yield* withCookieJar(
            cookieRef,
            client.todos.list().pipe(Effect.flip),
          )

          assertUnauthorized(meError)
          assertUnauthorized(listError)
        }),
      ),
  )

  it.effect("returns Unauthorized for an invalid session cookie", () =>
    withTestApi(
      Effect.gen(function* () {
        const cookieRef = yield* Ref.make<string | null>("app_session=invalid")
        const client = yield* HttpApiClient.make(Api)

        const error = yield* withCookieJar(
          cookieRef,
          client.session.me().pipe(Effect.flip),
        )

        assertUnauthorized(error)
      }),
    ),
  )

  it.effect("returns InvalidCredentials for a failed login", () =>
    withTestApi(
      Effect.gen(function* () {
        const cookieRef = yield* Ref.make<string | null>(null)
        const client = yield* HttpApiClient.make(Api)

        yield* withCookieJar(
          cookieRef,
          register(client, "failed-login@example.com"),
        )

        const error = yield* withCookieJar(
          cookieRef,
          client.auth
            .login({
              payload: new LoginInput({
                email: "failed-login@example.com",
                password: "wrong password",
              }),
            })
            .pipe(Effect.flip),
        )

        assertInvalidCredentials(error)
      }),
    ),
  )

  it.effect("returns UserAlreadyExists for duplicate registration", () =>
    withTestApi(
      Effect.gen(function* () {
        const cookieRef = yield* Ref.make<string | null>(null)
        const client = yield* HttpApiClient.make(Api)

        yield* withCookieJar(
          cookieRef,
          register(client, "duplicate@example.com"),
        )

        const error = yield* withCookieJar(
          cookieRef,
          register(client, " DUPLICATE@example.com ").pipe(Effect.flip),
        )

        assertUserAlreadyExists(error, "duplicate@example.com")
      }),
    ),
  )

  it.effect("clears the session cookie on logout", () =>
    withTestApi(
      Effect.gen(function* () {
        const cookieRef = yield* Ref.make<string | null>(null)
        const client = yield* HttpApiClient.make(Api)

        yield* withCookieJar(cookieRef, register(client, "logout@example.com"))
        const beforeLogout = yield* withCookieJar(
          cookieRef,
          client.session.me(),
        )
        const logout = yield* withCookieJar(cookieRef, client.auth.logout())
        const afterLogoutError = yield* withCookieJar(
          cookieRef,
          client.session.me().pipe(Effect.flip),
        )

        assert.strictEqual(beforeLogout.user.email, "logout@example.com")
        assert.strictEqual(logout.success, true)
        assertUnauthorized(afterLogoutError)
      }),
    ),
  )
})
