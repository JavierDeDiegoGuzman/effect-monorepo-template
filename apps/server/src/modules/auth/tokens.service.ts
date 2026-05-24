import type { UserId } from "@app/shared"
import { Context, type Effect, Schema } from "effect"

export class InvalidAuthToken extends Schema.TaggedErrorClass<InvalidAuthToken>()(
  "InvalidAuthToken",
  {
    message: Schema.String,
  },
) {}

export class AuthTokens extends Context.Service<
  AuthTokens,
  {
    readonly sign: (userId: UserId) => Effect.Effect<string>
    readonly verify: (
      token: string,
    ) => Effect.Effect<{ readonly userId: UserId }, InvalidAuthToken>
  }
>()("app/AuthTokens") {}
