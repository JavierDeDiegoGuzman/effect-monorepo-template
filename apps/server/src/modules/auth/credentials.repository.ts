import { Context, type Effect } from "effect"

export class AuthCredentialsRepository extends Context.Service<
  AuthCredentialsRepository,
  {
    readonly findPasswordHashByUserId: (
      userId: number,
    ) => Effect.Effect<string | null>
    readonly createPasswordCredential: (input: {
      readonly userId: number
      readonly passwordHash: string
    }) => Effect.Effect<void>
  }
>()("app/modules/auth/AuthCredentialsRepository") {}
