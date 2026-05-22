import { User } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { UsersRepository } from "./repository"

type UserRow = {
  readonly id: number
  readonly email: string
  readonly name: string
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

    const findByEmail = Effect.fn("PostgresUsersRepository.findByEmail")(
      function* (email: string) {
        const rows = yield* sql<UserRow>`
          SELECT id, email, name
          FROM users
          WHERE email = ${email}
          LIMIT 1
        `.pipe(Effect.orDie)

        const row = rows[0]
        return row === undefined ? null : toUser(row)
      },
    )

    const create = Effect.fn("PostgresUsersRepository.create")(
      function* (input: { readonly name: string; readonly email: string }) {
        const rows = yield* sql<UserRow>`
          INSERT INTO users (name, email)
          VALUES (${input.name}, ${input.email})
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
      findByEmail,
      create,
    })
  }),
)
