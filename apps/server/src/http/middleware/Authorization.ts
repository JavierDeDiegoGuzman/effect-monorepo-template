import { Authorization, CurrentUser, Unauthorized } from "@app/shared"
import { Effect, Layer, Redacted } from "effect"
import { AuthService } from "../../modules/auth"
import { withHttpErrorMapping } from "../errors"

export const AuthorizationLayer = Layer.effect(
  Authorization,
  Effect.gen(function* () {
    const auth = yield* AuthService

    return Authorization.of({
      session: Effect.fn(function* (httpEffect, { credential }) {
        const token = Redacted.value(credential)
        if (token.length === 0) {
          return yield* new Unauthorized()
        }

        const session = yield* withHttpErrorMapping(auth.verifySession(token))
        return yield* Effect.provideService(
          httpEffect,
          CurrentUser,
          session.user,
        )
      }),
    })
  }),
)
