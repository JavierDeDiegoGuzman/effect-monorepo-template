import { Effect, Schema, ServiceMap } from "effect"

export class InvalidAuthToken extends Schema.TaggedErrorClass<InvalidAuthToken>()(
  "InvalidAuthToken",
  {
    message: Schema.String,
  },
) {}

export class AuthTokens extends ServiceMap.Service<
  AuthTokens,
  {
    readonly sign: (userId: number) => Effect.Effect<string>
    readonly verify: (
      token: string,
    ) => Effect.Effect<{ readonly userId: number }, InvalidAuthToken>
  }
>()("app/AuthTokens") {}
