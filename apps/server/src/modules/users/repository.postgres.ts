import { User } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { type UserRecord, UsersRepository } from "./repository"

type UserRow = {
  readonly id: number
  readonly email: string
  readonly name: string
}

type UserAuthRow = UserRow & {
  readonly password_hash: string
}

const toUser = (row: UserRow) =>
  new User({
    id: row.id,
    email: row.email,
    name: row.name,
  })

export const PostgresUsersRepositoryLayer = Layer.effect(
  UsersRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const getById = Effect.fn("PostgresUsersRepository.getById")(function* (
      id: number,
    ) {
      const rows = yield* sql<UserRow>`
        SELECT id, email, name
        FROM users
        WHERE id = ${id}
        LIMIT 1
      `.pipe(Effect.orDie)

      const row = rows[0]
      return row === undefined ? null : toUser(row)
    })

    const getAuthByEmail = Effect.fn("PostgresUsersRepository.getAuthByEmail")(
      function* (email: string) {
        const rows = yield* sql<UserAuthRow>`
          SELECT id, email, name, password_hash
          FROM users
          WHERE email = ${email}
          LIMIT 1
        `.pipe(Effect.orDie)

        const row = rows[0]
        if (row === undefined) {
          return null
        }

        return {
          user: toUser(row),
          passwordHash: row.password_hash,
        } satisfies UserRecord
      },
    )

    const create = Effect.fn("PostgresUsersRepository.create")(
      function* (input: {
        readonly name: string
        readonly email: string
        readonly passwordHash: string
      }) {
        const rows = yield* sql<UserRow>`
        INSERT INTO users (name, email, password_hash)
        VALUES (${input.name}, ${input.email}, ${input.passwordHash})
        RETURNING id, email, name
      `.pipe(Effect.orDie)

        const row = rows[0]
        return row === undefined
          ? yield* Effect.die("Inserted user not returned")
          : toUser(row)
      },
    )

    return UsersRepository.of({
      getById,
      getAuthByEmail,
      create,
    })
  }),
)
