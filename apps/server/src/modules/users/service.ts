import type { User, UserAlreadyExists, UserNotFound } from "@app/shared"
import { Context, type Effect } from "effect"

export interface CreateUserServiceInput {
  readonly name: string
  readonly email: string
}

export class Users extends Context.Service<
  Users,
  {
    readonly getById: (id: number) => Effect.Effect<User, UserNotFound>
    readonly findByEmail: (email: string) => Effect.Effect<User | null>
    readonly create: (
      input: CreateUserServiceInput,
    ) => Effect.Effect<User, UserAlreadyExists>
  }
>()("app/Users") {}
