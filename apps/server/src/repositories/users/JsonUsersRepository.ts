import { User } from "@app/shared"
import { Effect, Layer, Ref } from "effect"
import { UsersRepository } from "./UsersRepository"

type UserRecord = {
  readonly user: User
  readonly passwordHash: string
}

export const makeJsonUsersRepositoryLayer = (
  initialRecords: ReadonlyArray<UserRecord> = [],
) =>
  Layer.effect(
    UsersRepository,
    Effect.gen(function* () {
      const nextId = yield* Ref.make(
        initialRecords.reduce(
          (max, record) => Math.max(max, record.user.id),
          0,
        ) + 1,
      )
      const store = yield* Ref.make(
        new Map(initialRecords.map((record) => [record.user.id, record])),
      )

      const getById = Effect.fn("JsonUsersRepository.getById")(function* (
        id: number,
      ) {
        return (yield* Ref.get(store)).get(id)?.user ?? null
      })

      const getAuthByEmail = Effect.fn(
        "JsonUsersRepository.getAuthByEmail",
      )(function* (email: string) {
        const normalized = email.trim().toLowerCase()
        for (const record of (yield* Ref.get(store)).values()) {
          if (record.user.email === normalized) {
            return record
          }
        }
        return null
      })

      const create = Effect.fn("JsonUsersRepository.create")(
        function* (input: {
          readonly name: string
          readonly email: string
          readonly passwordHash: string
        }) {
          const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
          const user = new User({
            id,
            name: input.name,
            email: input.email,
          })
          yield* Ref.update(store, (current) =>
            new Map(current).set(id, {
              user,
              passwordHash: input.passwordHash,
            }),
          )
          return user
        },
      )

      return UsersRepository.of({
        getById,
        getAuthByEmail,
        create,
      })
    }),
  )

export const JsonUsersRepositoryLayer = makeJsonUsersRepositoryLayer()
