import type {
  AuthSession,
  InvalidCredentials,
  LoginInput,
  RegisterInput,
  Unauthorized,
  UserAlreadyExists,
} from "@app/shared"
import { Context, type Effect } from "effect"

export type IssuedAuthSession = AuthSession & {
  readonly token: string
}

export class AuthService extends Context.Service<
  AuthService,
  {
    readonly register: (
      input: RegisterInput,
    ) => Effect.Effect<IssuedAuthSession, UserAlreadyExists>
    readonly login: (
      input: LoginInput,
    ) => Effect.Effect<IssuedAuthSession, InvalidCredentials>
    readonly verifySession: (
      token: string,
    ) => Effect.Effect<IssuedAuthSession, Unauthorized>
  }
>()("app/modules/auth/AuthService") {}
