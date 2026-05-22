import { User } from "@app/shared"
import { Effect, Layer } from "effect"
import { JsonDatabase, type JsonUserRecord } from "../../database/json"
import { type UserRecord, UsersRepository } from "./repository"

const toUser = (record: JsonUserRecord) =>
  new User({
    id: record.id,
    email: record.email,
    name: record.name,
  })

const toUserRecord = (record: JsonUserRecord): UserRecord => ({
  user: toUser(record),
  passwordHash: record.passwordHash,
})

export const JsonUsersRepositoryLayer = Layer.effect(
  UsersRepository,
  Effect.gen(function* () {
    const database = yield* JsonDatabase

    const getById = Effect.fn("JsonUsersRepository.getById")(function* (
      id: number,
    ) {
      const state = yield* database.read
      const record = state.users.find((user) => user.id === id)
      return record === undefined ? null : toUser(record)
    })

    const getAuthByEmail = Effect.fn("JsonUsersRepository.getAuthByEmail")(
      function* (email: string) {
        const normalized = email.trim().toLowerCase()
        const state = yield* database.read
        const record = state.users.find((user) => user.email === normalized)
        return record === undefined ? null : toUserRecord(record)
      },
    )

    const create = Effect.fn("JsonUsersRepository.create")(function* (input: {
      readonly name: string
      readonly email: string
      readonly passwordHash: string
    }) {
      return yield* database.update((state) => {
        const id =
          state.users.reduce((max, user) => Math.max(max, user.id), 0) + 1
        const record: JsonUserRecord = {
          id,
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash,
        }

        return [
          {
            ...state,
            users: [...state.users, record],
          },
          toUser(record),
        ]
      })
    })

    return UsersRepository.of({
      getById,
      getAuthByEmail,
      create,
    })
  }),
)
