import type { User } from "@app/shared"
import { Context, type Effect } from "effect"

export class UsersRepository extends Context.Service<
  UsersRepository,
  {
    readonly getById: (id: number) => Effect.Effect<User | null>
    readonly findByEmail: (email: string) => Effect.Effect<User | null>
    readonly create: (input: {
      readonly name: string
      readonly email: string
    }) => Effect.Effect<User>
  }
>()("app/modules/users/UsersRepository") {}
