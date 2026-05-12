import { type User, UserAlreadyExists, UserNotFound } from "@app/shared"
import { Effect, ServiceMap } from "effect"
import type { UserRecord } from "../../repositories/UsersRepository"

export interface CreateUserServiceInput {
  readonly name: string
  readonly email: string
  readonly passwordHash: string
}

export class Users extends ServiceMap.Service<
  Users,
  {
    readonly getById: (id: number) => Effect.Effect<User, UserNotFound>
    readonly getAuthByEmail: (email: string) => Effect.Effect<UserRecord | null>
    readonly create: (
      input: CreateUserServiceInput,
    ) => Effect.Effect<User, UserAlreadyExists>
  }
>()("app/Users") {}
