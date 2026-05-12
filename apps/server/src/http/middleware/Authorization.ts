import { Authorization, CurrentUser, Unauthorized } from "@app/shared"
import { Effect, Layer, Redacted } from "effect"
import { AuthTokens } from "../../services/auth-tokens/AuthTokens"
import { Users } from "../../services/users/Users"

export const AuthorizationLayer = Layer.effect(
  Authorization,
  Effect.gen(function* () {
    const authTokens = yield* AuthTokens
    const users = yield* Users

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

        return yield* Effect.provideService(httpEffect, CurrentUser, user)
      }),
    })
  }),
)
