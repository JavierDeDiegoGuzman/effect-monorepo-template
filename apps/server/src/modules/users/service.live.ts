import { UserAlreadyExists, UserNotFound } from "@app/shared"
import { Effect, Layer } from "effect"
import { UsersRepository } from "./repository"
import { type CreateUserServiceInput, Users } from "./service"

const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const UsersLive = Layer.effect(
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

    const create = Effect.fn("Users.create")(function* (
      input: CreateUserServiceInput,
    ) {
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
