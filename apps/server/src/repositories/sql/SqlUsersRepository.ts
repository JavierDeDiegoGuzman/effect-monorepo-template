import { User } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { type UserRecord, UsersRepository } from "../UsersRepository"

const insertedIdFrom = (result: unknown) =>
  Number(
    (result as { readonly lastInsertRowid: number | bigint }).lastInsertRowid,
  )

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

    const getAuthByEmail = Effect.fn("SqlUsersRepository.getAuthByEmail")(
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

    const create = Effect.fn("SqlUsersRepository.create")(function* (input: {
      readonly name: string
      readonly email: string
      readonly passwordHash: string
    }) {
      const result = yield* sql`
        INSERT INTO users (name, email, password_hash)
        VALUES (${input.name}, ${input.email}, ${input.passwordHash})
      `.raw.pipe(Effect.orDie)

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
      getAuthByEmail,
      create,
    })
  }),
)
