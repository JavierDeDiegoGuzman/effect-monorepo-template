import type { User } from "@app/shared"
import { Context, type Effect } from "effect"
import type { RepositoryError } from "../../errors/repository"

export class UsersRepository extends Context.Service<
  UsersRepository,
  {
    readonly getById: (
      id: number,
    ) => Effect.Effect<User | null, RepositoryError>
    readonly findByEmail: (
      email: string,
    ) => Effect.Effect<User | null, RepositoryError>
    readonly create: (input: {
      readonly name: string
      readonly email: string
    }) => Effect.Effect<User, RepositoryError>
  }
>()("app/modules/users/UsersRepository") {}
