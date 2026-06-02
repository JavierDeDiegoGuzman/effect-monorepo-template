import { User } from "@app/shared"
import { Effect, Layer, Ref } from "effect"
import { UsersRepository } from "./repository"

export const makeInMemoryUsersRepositoryLayer = (
  initialUsers: ReadonlyArray<User> = [],
) =>
  Layer.effect(
    UsersRepository,
    Effect.gen(function* () {
      const store = yield* Ref.make(
        new Map(initialUsers.map((user) => [user.id, user])),
      )

      const getById = Effect.fn("InMemoryUsersRepository.getById")(
        function* (id) {
          return (yield* Ref.get(store)).get(id) ?? null
        },
      )

      const findByEmail = Effect.fn("InMemoryUsersRepository.findByEmail")(
        function* (email: string) {
          const normalized = email.trim().toLowerCase()
          for (const user of (yield* Ref.get(store)).values()) {
            if (user.email === normalized) {
              return user
            }
          }
          return null
        },
      )

      const create = Effect.fn("InMemoryUsersRepository.create")(
        function* (input) {
          const user = new User({
            id: input.id,
            name: input.name,
            email: input.email,
          })
          yield* Ref.update(store, (current) =>
            new Map(current).set(input.id, user),
          )
          return user
        },
      )

      return UsersRepository.of({
        getById,
        findByEmail,
        create,
      })
    }),
  )

export const InMemoryUsersRepositoryLayer = makeInMemoryUsersRepositoryLayer()
