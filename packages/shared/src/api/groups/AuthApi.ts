import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { InvalidCredentials, User, UserAlreadyExists } from "../../domain/User"
import { Authorization, Unauthorized } from "../middleware/Authorization"

export class RegisterInput extends Schema.Class<RegisterInput>("RegisterInput")(
  {
    name: Schema.String,
    email: Schema.String,
    password: Schema.String,
  },
) {}

export class LoginInput extends Schema.Class<LoginInput>("LoginInput")({
  email: Schema.String,
  password: Schema.String,
}) {}

export class CurrentSession extends Schema.Class<CurrentSession>(
  "CurrentSession",
)({
  user: User,
}) {}

export class AuthSession extends Schema.Class<AuthSession>("AuthSession")({
  token: Schema.String,
  user: User,
}) {}

export class AuthApi extends HttpApiGroup.make("auth")
  .add(
    HttpApiEndpoint.post("register", "/auth/register", {
      payload: RegisterInput,
      success: AuthSession,
      error: UserAlreadyExists,
    }),
    HttpApiEndpoint.post("login", "/auth/login", {
      payload: LoginInput,
      success: AuthSession,
      error: InvalidCredentials,
    }),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "Auth",
      description: "Authentication endpoints",
    }),
  ) {}

export class SessionApi extends HttpApiGroup.make("session")
  .add(
    HttpApiEndpoint.get("me", "/auth/me", {
      success: CurrentSession,
      error: Unauthorized,
    }),
  )
  .middleware(Authorization)
  .annotateMerge(
    OpenApi.annotations({
      title: "Session",
      description: "Authenticated session endpoints",
    }),
  ) {}
