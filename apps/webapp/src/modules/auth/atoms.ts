import type { LoginInput, RegisterInput } from "@app/shared"
import { Effect } from "effect"
import * as Atom from "effect/unstable/reactivity/Atom"
import { ApiClient } from "@/api/client"
import { apiRuntime } from "@/lib/runtime"

export const currentSessionQuery = apiRuntime
  .atom(
    ApiClient.use((client) => client.session.me()).pipe(
      Effect.match({
        onFailure: () => null,
        onSuccess: (session) => session,
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
      Effect.withSpan("auth.login", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["auth", "todos"] },
)

export const registerAction = apiRuntime.fn(
  (input: RegisterInput) =>
    ApiClient.use((client) => client.auth.register({ payload: input })).pipe(
      Effect.withSpan("auth.register", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["auth", "todos"] },
)

export const logoutAction = apiRuntime.fn(
  () =>
    ApiClient.use((client) => client.auth.logout()).pipe(
      Effect.withSpan("auth.logout", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["auth", "todos"] },
)
