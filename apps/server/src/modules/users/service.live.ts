import { makeUserId, UserAlreadyExists, UserNotFound } from "@app/shared"
import { Effect, Layer, Random } from "effect"
import { UsersRepository } from "./repository"
import { type CreateUserServiceInput, Users } from "./service"

const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const UsersLive = Layer.effect(
  Users,
  Effect.gen(function* () {
    const usersRepository = yield* UsersRepository

    const getById = Effect.fn("Users.getById")(function* (id) {
      const user = yield* usersRepository.getById(id)
      if (user === null) {
        return yield* new UserNotFound({ id })
      }
      return user
    })

    const findByEmail = Effect.fn("Users.findByEmail")(function* (
      email: string,
    ) {
      return yield* usersRepository.findByEmail(normalizeEmail(email))
    })

    const create = Effect.fn("Users.create")(function* (
      input: CreateUserServiceInput,
    ) {
      const email = normalizeEmail(input.email)
      const existing = yield* usersRepository.findByEmail(email)

      if (existing !== null) {
        return yield* new UserAlreadyExists({ email })
      }

      const id = makeUserId(yield* Random.nextUUIDv4)

      return yield* usersRepository.create({
        id,
        name: input.name.trim(),
        email,
      })
    })

    return Users.of({
      getById,
      findByEmail,
      create,
    })
  }),
)
