import type { LoginInput, RegisterInput } from "@app/shared"
import { Effect } from "effect"
import * as Layer from "effect/Layer"
import * as Atom from "effect/unstable/reactivity/Atom"
import { ApiClient } from "@/api/client"
import {
  clearAuthToken,
  isProbablyJwt,
  readAuthToken,
  writeAuthToken,
} from "@/lib/auth-storage"
import { ObservabilityLayer } from "@/observability"

const apiRuntime = Atom.runtime(
  Layer.mergeAll(ApiClient.layer, ObservabilityLayer),
)

export const currentSessionQuery = apiRuntime
  .atom(
    Effect.sync(readAuthToken).pipe(
      Effect.flatMap((token) => {
        if (token === null) {
          return Effect.succeed(null)
        }

        if (!isProbablyJwt(token)) {
          clearAuthToken()
          return Effect.succeed(null)
        }

        return ApiClient.use((client) => client.session.me()).pipe(
          Effect.match({
            onFailure: () => {
              clearAuthToken()
              return null
            },
            onSuccess: (session) => session,
          }),
        )
      }),
      Effect.withSpan("auth.me", {
        kind: "client",
      }),
    ),
  )
  .pipe(Atom.keepAlive, Atom.withReactivity(["auth"]))

export const loginAction = apiRuntime.fn(
  (input: LoginInput) =>
    ApiClient.use((client) => client.auth.login({ payload: input })).pipe(
      Effect.tap((session) => Effect.sync(() => writeAuthToken(session.token))),
      Effect.withSpan("auth.login", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["auth", "todos"] },
)

export const registerAction = apiRuntime.fn(
  (input: RegisterInput) =>
    ApiClient.use((client) => client.auth.register({ payload: input })).pipe(
      Effect.tap((session) => Effect.sync(() => writeAuthToken(session.token))),
      Effect.withSpan("auth.register", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["auth", "todos"] },
)

export const logoutAction = apiRuntime.fn(
  () =>
    Effect.sync(() => {
      clearAuthToken()
    }).pipe(
      Effect.withSpan("auth.logout", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["auth", "todos"] },
)
