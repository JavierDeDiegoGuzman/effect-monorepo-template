import type { UserId } from "@app/shared"
import { Context, type Effect } from "effect"
import type { RepositoryError } from "../../errors/repository"

export class AuthCredentialsRepository extends Context.Service<
  AuthCredentialsRepository,
  {
    readonly findPasswordHashByUserId: (
      userId: UserId,
    ) => Effect.Effect<string | null, RepositoryError>
    readonly createPasswordCredential: (input: {
      readonly userId: UserId
      readonly passwordHash: string
    }) => Effect.Effect<void, RepositoryError>
  }
>()("app/modules/auth/AuthCredentialsRepository") {}
