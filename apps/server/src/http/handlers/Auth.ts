import {
  Api,
  AuthSession,
  CurrentSession,
  CurrentUser,
  CurrentWorkspace,
  InvalidCredentials,
} from "@app/shared"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { AuthTokens } from "../../services/AuthTokens"
import { Passwords } from "../../services/Passwords"
import { Users } from "../../services/Users"
import { Workspaces } from "../../services/Workspaces"

export const AuthApiHandlers = HttpApiBuilder.group(
  Api,
  "auth",
  Effect.fn(function* (handlers) {
    const authTokens = yield* AuthTokens
    const passwords = yield* Passwords
    const users = yield* Users
    const workspaces = yield* Workspaces

    return handlers
      .handle("register", ({ payload }) =>
        Effect.gen(function* () {
          const passwordHash = yield* passwords.hash(payload.password)
          const user = yield* users.create({
            name: payload.name,
            email: payload.email,
            passwordHash,
          })
          const workspace = yield* workspaces.createPersonalForUser(user)
          const token = yield* authTokens.sign(user.id)

          return new AuthSession({
            token,
            user,
            workspace,
          })
        }).pipe(
          Effect.annotateSpans({
            "http.route": "/auth/register",
            "http.method": "POST",
            "auth.email": payload.email.trim().toLowerCase(),
          }),
        ),
      )
      .handle("login", ({ payload }) =>
        Effect.gen(function* () {
          const authRecord = yield* users.getAuthByEmail(payload.email)
          if (authRecord === null) {
            return yield* new InvalidCredentials({
              message: "Invalid email or password",
            })
          }

          const validPassword = yield* passwords.verify(
            payload.password,
            authRecord.passwordHash,
          )
          if (!validPassword) {
            return yield* new InvalidCredentials({
              message: "Invalid email or password",
            })
          }

          const workspace = yield* workspaces.getCurrentForUser(
            authRecord.user.id,
          )
          const token = yield* authTokens.sign(authRecord.user.id)

          return new AuthSession({
            token,
            user: authRecord.user,
            workspace,
          })
        }).pipe(
          Effect.annotateSpans({
            "http.route": "/auth/login",
            "http.method": "POST",
            "auth.email": payload.email.trim().toLowerCase(),
          }),
        ),
      )
  }),
)

export const SessionApiHandlers = HttpApiBuilder.group(
  Api,
  "session",
  Effect.fn(function* (handlers) {
    return handlers.handle("me", () =>
      Effect.all({
        user: CurrentUser.asEffect(),
        workspace: CurrentWorkspace.asEffect(),
      }).pipe(
        Effect.map((session) => new CurrentSession(session)),
        Effect.annotateSpans({
          "http.route": "/auth/me",
          "http.method": "GET",
        }),
      ),
    )
  }),
)
