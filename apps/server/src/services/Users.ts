import { type User, UserAlreadyExists, UserNotFound } from "@app/shared"
import { Effect, Layer, ServiceMap } from "effect"
import {
  type UserRecord,
  UsersRepository,
} from "../repositories/UsersRepository"

const normalizeEmail = (email: string) => email.trim().toLowerCase()

export class Users extends ServiceMap.Service<
  Users,
  {
    readonly getById: (id: number) => Effect.Effect<User, UserNotFound>
    readonly getAuthByEmail: (email: string) => Effect.Effect<UserRecord | null>
    readonly create: (input: {
      readonly name: string
      readonly email: string
      readonly passwordHash: string
    }) => Effect.Effect<User, UserAlreadyExists>
  }
>()("app/Users") {
  static readonly layer = Layer.effect(
    Users,
    Effect.gen(function* () {
      const usersRepository = yield* UsersRepository

      const getById = Effect.fn("Users.getById")(function* (id: number) {
        const user = yield* usersRepository.getById(id)
        if (user === null) {
          return yield* new UserNotFound({ id })
        }
        return user
      })

      const getAuthByEmail = Effect.fn("Users.getAuthByEmail")(function* (
        email: string,
      ) {
        return yield* usersRepository.getAuthByEmail(normalizeEmail(email))
      })

      const create = Effect.fn("Users.create")(function* (input: {
        readonly name: string
        readonly email: string
        readonly passwordHash: string
      }) {
        const email = normalizeEmail(input.email)
        const existing = yield* usersRepository.getAuthByEmail(email)

        if (existing !== null) {
          return yield* new UserAlreadyExists({ email })
        }

        return yield* usersRepository.create({
          name: input.name.trim(),
          email,
          passwordHash: input.passwordHash,
        })
      })

      return Users.of({
        getById,
        getAuthByEmail,
        create,
      })
    }),
  )
}
