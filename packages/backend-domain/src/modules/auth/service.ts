import type {
  AuthSession,
  InvalidCredentials,
  LoginInput,
  RegisterInput,
  Unauthorized,
  UserAlreadyExists,
} from "@app/shared"
import { Context, type Effect } from "effect"
import type { RepositoryError } from "../../errors/repository"

export type IssuedAuthSession = AuthSession & {
  readonly token: string
}

export class AuthService extends Context.Service<
  AuthService,
  {
    readonly register: (
      input: RegisterInput,
    ) => Effect.Effect<IssuedAuthSession, UserAlreadyExists | RepositoryError>
    readonly login: (
      input: LoginInput,
    ) => Effect.Effect<IssuedAuthSession, InvalidCredentials | RepositoryError>
    readonly verifySession: (
      token: string,
    ) => Effect.Effect<IssuedAuthSession, Unauthorized | RepositoryError>
  }
>()("app/modules/auth/AuthService") {}
