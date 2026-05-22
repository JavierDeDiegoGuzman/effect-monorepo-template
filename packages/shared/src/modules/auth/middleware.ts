import { Context, Effect, Schema } from "effect"
import { HttpApiMiddleware, HttpApiSecurity } from "effect/unstable/httpapi"
import { InternalServerError } from "../../errors"
import type { User } from "../users"

export const authSessionCookieName = "app_session"

export class CurrentUser extends Context.Service<CurrentUser, User>()(
  "app/Authorization/CurrentUser",
) {}

export class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  {
    message: Schema.String.pipe(
      Schema.withConstructorDefault(Effect.succeed("Authentication required")),
    ),
  },
  { httpApiStatus: 401 },
) {}

export class Authorization extends HttpApiMiddleware.Service<
  Authorization,
  {
    provides: CurrentUser
    requires: never
  }
>()("app/Authorization", {
  requiredForClient: false,
  security: {
    session: HttpApiSecurity.apiKey({
      key: authSessionCookieName,
      in: "cookie",
    }),
  },
  error: Schema.Union([Unauthorized, InternalServerError]),
}) {}
