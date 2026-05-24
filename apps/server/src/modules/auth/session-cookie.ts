import { Config, Context, Effect, Layer } from "effect"
import * as HttpEffect from "effect/unstable/http/HttpEffect"
import type { HttpServerRequest } from "effect/unstable/http/HttpServerRequest"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"

export const authSessionCookieName = "app_session"

type SameSite = "lax" | "strict" | "none"

const sameSiteValues: ReadonlySet<string> = new Set(["lax", "strict", "none"])

const isSameSite = (value: string): value is SameSite =>
  sameSiteValues.has(value)

const authSessionCookieConfig = Effect.gen(function* () {
  const sameSite = yield* Config.nonEmptyString(
    "AUTH_SESSION_COOKIE_SAME_SITE",
  ).pipe(Config.withDefault("lax"))

  if (!isSameSite(sameSite)) {
    return yield* Effect.die(
      new Error(`Invalid AUTH_SESSION_COOKIE_SAME_SITE value: ${sameSite}`),
    )
  }

  return {
    secure: yield* Config.boolean("AUTH_SESSION_COOKIE_SECURE").pipe(
      Config.withDefault(false),
    ),
    sameSite,
    maxAgeSeconds: yield* Config.int("AUTH_ACCESS_TOKEN_TTL_SECONDS").pipe(
      Config.withDefault(60 * 60),
    ),
  }
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
    const options: Readonly<{
      httpOnly: true
      secure: boolean
      sameSite: SameSite
      path: "/"
    }> = {
      httpOnly: true,
      secure: config.secure,
      sameSite: config.sameSite,
      path: "/",
    }

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
