import {
  Authorization,
  CurrentUser,
  CurrentWorkspace,
  Unauthorized,
} from "@app/shared"
import { Effect, Layer, Redacted } from "effect"
import { AuthTokens } from "../../services/AuthTokens"
import { Users } from "../../services/Users"
import { Workspaces } from "../../services/Workspaces"

export const AuthorizationLayer = Layer.effect(
  Authorization,
  Effect.gen(function* () {
    const authTokens = yield* AuthTokens
    const users = yield* Users
    const workspaces = yield* Workspaces

    return Authorization.of({
      bearer: Effect.fn(function* (httpEffect, { credential }) {
        const token = Redacted.value(credential)

        const verified = yield* authTokens.verify(token).pipe(
          Effect.mapError(
            () =>
              new Unauthorized({
                message: "Missing or invalid bearer token",
              }),
          ),
        )

        const user = yield* users.getById(verified.userId).pipe(
          Effect.mapError(
            () =>
              new Unauthorized({
                message: "Missing or invalid bearer token",
              }),
          ),
        )
        const workspace = yield* workspaces.getCurrentForUser(user.id).pipe(
          Effect.mapError(
            () =>
              new Unauthorized({
                message: "Missing or invalid bearer token",
              }),
          ),
        )

        return yield* Effect.provideService(
          Effect.provideService(httpEffect, CurrentUser, user),
          CurrentWorkspace,
          workspace,
        )
      }),
    })
  }),
)
