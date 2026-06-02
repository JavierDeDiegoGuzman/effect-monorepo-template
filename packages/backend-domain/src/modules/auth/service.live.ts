import { AuthSession, InvalidCredentials, Unauthorized } from "@app/shared"
import { Effect, Layer } from "effect"
import { Transactions } from "../../transactions"
import { Users } from "../users"
import { AuthCredentialsRepository } from "./credentials.repository"
import { Passwords } from "./passwords.service"
import { AuthService } from "./service"
import { AuthTokens } from "./tokens.service"

const invalidCredentials = () => new InvalidCredentials()

export const AuthLive = Layer.effect(
  AuthService,
  Effect.gen(function* () {
    const users = yield* Users
    const credentials = yield* AuthCredentialsRepository
    const passwords = yield* Passwords
    const authTokens = yield* AuthTokens
    const transactions = yield* Transactions

    const register = Effect.fn("Auth.register")(function* (input: {
      readonly name: string
      readonly email: string
      readonly password: string
    }) {
      yield* Effect.annotateCurrentSpan({
        "auth.email.length": input.email.trim().length,
        "auth.name.length": input.name.trim().length,
      })

      const passwordHash = yield* passwords.hash(input.password)

      const user = yield* transactions.withTransaction(
        Effect.gen(function* () {
          const user = yield* users.create({
            name: input.name,
            email: input.email,
          })
          yield* credentials.createPasswordCredential({
            userId: user.id,
            passwordHash,
          })
          return user
        }),
      )

      const token = yield* authTokens.sign(user.id)
      return Object.assign(new AuthSession({ user }), { token })
    })

    const login = Effect.fn("Auth.login")(function* (input: {
      readonly email: string
      readonly password: string
    }) {
      yield* Effect.annotateCurrentSpan({
        "auth.email.length": input.email.trim().length,
      })

      const user = yield* users.findByEmail(input.email)
      if (user === null) {
        return yield* invalidCredentials()
      }

      const passwordHash = yield* credentials.findPasswordHashByUserId(user.id)
      if (passwordHash === null) {
        return yield* invalidCredentials()
      }

      const validPassword = yield* passwords.verify(
        input.password,
        passwordHash,
      )
      if (!validPassword) {
        return yield* invalidCredentials()
      }

      const token = yield* authTokens.sign(user.id)
      return Object.assign(new AuthSession({ user }), { token })
    })

    const verifySession = Effect.fn("Auth.verifySession")(function* (
      token: string,
    ) {
      yield* Effect.annotateCurrentSpan({ "auth.has_token": token.length > 0 })
      const verified = yield* authTokens
        .verify(token)
        .pipe(
          Effect.catchTag("InvalidAuthToken", () =>
            Effect.fail(new Unauthorized()),
          ),
        )

      const user = yield* users
        .getById(verified.userId)
        .pipe(
          Effect.catchTag("UserNotFound", () =>
            Effect.fail(new Unauthorized()),
          ),
        )

      return Object.assign(new AuthSession({ user }), { token })
    })

    return AuthService.of({
      register,
      login,
      verifySession,
    })
  }),
)
