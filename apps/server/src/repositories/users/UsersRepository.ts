import type { User } from "@app/shared"
import { type Effect, ServiceMap } from "effect"

export type UserRecord = {
  readonly user: User
  readonly passwordHash: string
}

export class UsersRepository extends ServiceMap.Service<
  UsersRepository,
  {
    readonly getById: (id: number) => Effect.Effect<User | null>
    readonly getAuthByEmail: (email: string) => Effect.Effect<UserRecord | null>
    readonly create: (input: {
      readonly name: string
      readonly email: string
      readonly passwordHash: string
    }) => Effect.Effect<User>
  }
>()("app/repositories/UsersRepository") {}
