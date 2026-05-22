import { User } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { UsersRepository } from "./repository"

type SqliteInsertResult = {
  readonly lastInsertRowid: number | bigint
}

const insertedIdFrom = (result: SqliteInsertResult) =>
  Number(result.lastInsertRowid)

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

export const SqlUsersRepositoryLayer = Layer.effect(
  UsersRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const getById = Effect.fn("SqlUsersRepository.getById")(function* (
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

    const findByEmail = Effect.fn("SqlUsersRepository.findByEmail")(function* (
      email: string,
    ) {
      const rows = yield* sql<UserRow>`
        SELECT id, email, name
        FROM users
        WHERE email = ${email}
        LIMIT 1
      `.pipe(Effect.orDie)

      const row = rows[0]
      return row === undefined ? null : toUser(row)
    })

    const create = Effect.fn("SqlUsersRepository.create")(function* (input: {
      readonly name: string
      readonly email: string
    }) {
      const result = (yield* sql`
        INSERT INTO users (name, email)
        VALUES (${input.name}, ${input.email})
      `.raw.pipe(Effect.orDie)) as SqliteInsertResult

      return yield* getById(insertedIdFrom(result)).pipe(
        Effect.flatMap((user) =>
          user === null
            ? Effect.die("Inserted user not found")
            : Effect.succeed(user),
        ),
      )
    })

    return UsersRepository.of({
      getById,
      findByEmail,
      create,
    })
  }),
)
