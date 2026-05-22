import { Context, type Effect } from "effect"
import type { RepositoryError } from "../../errors/repository"

export class AuthCredentialsRepository extends Context.Service<
  AuthCredentialsRepository,
  {
    readonly findPasswordHashByUserId: (
      userId: number,
    ) => Effect.Effect<string | null, RepositoryError>
    readonly createPasswordCredential: (input: {
      readonly userId: number
      readonly passwordHash: string
    }) => Effect.Effect<void, RepositoryError>
  }
>()("app/modules/auth/AuthCredentialsRepository") {}
