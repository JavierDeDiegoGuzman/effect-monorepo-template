import {
  Api,
  AuthSession,
  CurrentSession,
  CurrentUser,
  LogoutSuccess,
} from "@app/shared"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { AuthService } from "./service"
import { AuthSessionCookies } from "./session-cookie"

export const AuthApiHandlers = HttpApiBuilder.group(
  Api,
  "auth",
  Effect.fn(function* (handlers) {
    const auth = yield* AuthService
    const sessionCookies = yield* AuthSessionCookies

    return handlers
      .handle("register", ({ payload }) =>
        auth.register(payload).pipe(
          Effect.tap((session) => sessionCookies.set(session.token)),
          Effect.map(({ user }) => new AuthSession({ user })),
          Effect.annotateSpans({
            "http.route": "/auth/register",
            "http.method": "POST",
            "auth.email": payload.email.trim().toLowerCase(),
          }),
        ),
      )
      .handle("login", ({ payload }) =>
        auth.login(payload).pipe(
          Effect.tap((session) => sessionCookies.set(session.token)),
          Effect.map(({ user }) => new AuthSession({ user })),
          Effect.annotateSpans({
            "http.route": "/auth/login",
            "http.method": "POST",
            "auth.email": payload.email.trim().toLowerCase(),
          }),
        ),
      )
      .handle("logout", () =>
        sessionCookies.clear.pipe(
          Effect.as(new LogoutSuccess({ success: true })),
          Effect.annotateSpans({
            "http.route": "/auth/logout",
            "http.method": "POST",
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
      CurrentUser.asEffect().pipe(
        Effect.map((user) => new CurrentSession({ user })),
        Effect.annotateSpans({
          "http.route": "/auth/me",
          "http.method": "GET",
        }),
      ),
    )
  }),
)
