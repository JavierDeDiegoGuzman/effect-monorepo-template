import { Config, Effect, Layer } from "effect"
import { jwtVerify, SignJWT } from "jose"
import { AuthTokens, InvalidAuthToken } from "./tokens.service"

const authTokenConfig = Effect.gen(function* () {
  return {
    secret: yield* Config.nonEmptyString("AUTH_JWT_SECRET"),
    issuer: yield* Config.nonEmptyString("AUTH_JWT_ISSUER"),
    audience: yield* Config.nonEmptyString("AUTH_JWT_AUDIENCE"),
    ttlSeconds: yield* Config.int("AUTH_ACCESS_TOKEN_TTL_SECONDS").pipe(
      Config.withDefault(60 * 60),
    ),
  } as const
})

const makeSecret = (secret: string) => new TextEncoder().encode(secret)

export const AuthTokensLive = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* authTokenConfig
    const secret = makeSecret(config.secret)

    return Layer.succeed(
      AuthTokens,
      AuthTokens.of({
        sign: (userId: number) =>
          Effect.tryPromise({
            try: async () =>
              new SignJWT({})
                .setProtectedHeader({ alg: "HS256" })
                .setSubject(String(userId))
                .setIssuer(config.issuer)
                .setAudience(config.audience)
                .setIssuedAt()
                .setExpirationTime(`${config.ttlSeconds}s`)
                .sign(secret),
            catch: (error) =>
              new Error(`Failed to sign auth token: ${String(error)}`),
          }).pipe(Effect.orDie),
        verify: (token: string) =>
          Effect.tryPromise({
            try: async () => {
              const verified = await jwtVerify(token, secret, {
                issuer: config.issuer,
                audience: config.audience,
              })
              const userId = Number(verified.payload.sub)
              if (!Number.isFinite(userId)) {
                throw new Error("Token subject is not a valid user id")
              }
              return { userId }
            },
            catch: (error) =>
              new InvalidAuthToken({
                message: `Failed to verify auth token: ${String(error)}`,
              }),
          }),
      }),
    )
  }),
)
