import type { User, UserAlreadyExists, UserNotFound } from "@app/shared"
import { Context, type Effect } from "effect"
import type { RepositoryError } from "../../errors/repository"

export interface CreateUserServiceInput {
  readonly name: string
  readonly email: string
}

export class Users extends Context.Service<
  Users,
  {
    readonly getById: (
      id: number,
    ) => Effect.Effect<User, UserNotFound | RepositoryError>
    readonly findByEmail: (
      email: string,
    ) => Effect.Effect<User | null, RepositoryError>
    readonly create: (
      input: CreateUserServiceInput,
    ) => Effect.Effect<User, UserAlreadyExists | RepositoryError>
  }
>()("app/Users") {}
