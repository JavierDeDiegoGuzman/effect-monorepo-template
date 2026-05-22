import { Config, Context, Effect, Layer } from "effect"
import * as HttpEffect from "effect/unstable/http/HttpEffect"
import type { HttpServerRequest } from "effect/unstable/http/HttpServerRequest"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"

export const authSessionCookieName = "app_session"

const authSessionCookieConfig = Effect.gen(function* () {
  return {
    secure: yield* Config.boolean("AUTH_SESSION_COOKIE_SECURE").pipe(
      Config.withDefault(false),
    ),
    sameSite: yield* Config.nonEmptyString(
      "AUTH_SESSION_COOKIE_SAME_SITE",
    ).pipe(Config.withDefault("lax")),
    maxAgeSeconds: yield* Config.int("AUTH_ACCESS_TOKEN_TTL_SECONDS").pipe(
      Config.withDefault(60 * 60),
    ),
  } as const
})

export class AuthSessionCookies extends Context.Service<
  AuthSessionCookies,
  {
    readonly set: (
      token: string,
    ) => Effect.Effect<void, never, HttpServerRequest>
    readonly clear: Effect.Effect<void, never, HttpServerRequest>
  }
>()("app/modules/auth/AuthSessionCookies") {}

export const AuthSessionCookiesLive = Layer.effect(
  AuthSessionCookies,
  Effect.gen(function* () {
    const config = yield* authSessionCookieConfig
    const options = {
      httpOnly: true,
      secure: config.secure,
      sameSite: config.sameSite as "lax" | "strict" | "none",
      path: "/",
    } as const

    return AuthSessionCookies.of({
      set: (token) =>
        HttpEffect.appendPreResponseHandler((_request, response) =>
          HttpServerResponse.setCookie(response, authSessionCookieName, token, {
            ...options,
            maxAge: `${config.maxAgeSeconds} seconds`,
          }).pipe(Effect.orDie),
        ),
      clear: HttpEffect.appendPreResponseHandler((_request, response) =>
        HttpServerResponse.expireCookie(
          response,
          authSessionCookieName,
          options,
        ).pipe(Effect.orDie),
      ),
    })
  }),
)
