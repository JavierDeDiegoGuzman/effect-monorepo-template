import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import {
  AuthSession,
  CurrentSession,
  LoginInput,
  RegisterInput,
} from "../../domain/Auth"
import { InvalidCredentials, UserAlreadyExists } from "../../domain/User"
import { Authorization, Unauthorized } from "../middleware/Authorization"

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
