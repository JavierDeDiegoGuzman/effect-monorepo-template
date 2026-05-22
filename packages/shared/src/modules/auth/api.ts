import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { InternalServerError } from "../../errors"
import { UserAlreadyExists } from "../users"
import {
  AuthSession,
  CurrentSession,
  LoginInput,
  LogoutSuccess,
  RegisterInput,
} from "./contract"
import { InvalidCredentials } from "./errors"
import { Authorization, Unauthorized } from "./middleware"

export class AuthApi extends HttpApiGroup.make("auth")
  .add(
    HttpApiEndpoint.post("register", "/auth/register", {
      payload: RegisterInput,
      success: AuthSession,
      error: Schema.Union([UserAlreadyExists, InternalServerError]),
    }),
    HttpApiEndpoint.post("login", "/auth/login", {
      payload: LoginInput,
      success: AuthSession,
      error: Schema.Union([InvalidCredentials, InternalServerError]),
    }),
    HttpApiEndpoint.post("logout", "/auth/logout", {
      success: LogoutSuccess,
      error: InternalServerError,
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
      error: Schema.Union([Unauthorized, InternalServerError]),
    }),
  )
  .middleware(Authorization)
  .annotateMerge(
    OpenApi.annotations({
      title: "Session",
      description: "Authenticated session endpoints",
    }),
  ) {}
