import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { UserAlreadyExists } from "../users"
import {
  AuthSession,
  CurrentSession,
  LoginInput,
  RegisterInput,
} from "./contract"
import { InvalidCredentials } from "./errors"
import { Authorization, Unauthorized } from "./middleware"

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
