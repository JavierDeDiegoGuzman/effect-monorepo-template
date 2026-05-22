import { Context, Schema } from "effect"
import { HttpApiMiddleware, HttpApiSecurity } from "effect/unstable/httpapi"
import type { User } from "../users"

export const authSessionCookieName = "app_session"

export class CurrentUser extends Context.Service<CurrentUser, User>()(
  "app/Authorization/CurrentUser",
) {}

export class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  {
    message: Schema.String,
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
  error: Unauthorized,
}) {}
