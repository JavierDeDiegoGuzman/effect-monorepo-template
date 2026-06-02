import { makeUserId, User } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import {
  makeRepositoryError,
  mapRepositoryError,
  oneOrNull,
  requireReadBack,
} from "../../database/sqlRepositoryHelpers"
import { UsersRepository } from "@app/backend-domain"

type UserRow = {
  readonly id: string
  readonly email: string
  readonly name: string
}

const toUser = (row: UserRow) =>
  new User({
    id: makeUserId(row.id),
    email: row.email,
    name: row.name,
  })

const repositoryError = makeRepositoryError("UsersRepository")

export const PostgresUsersRepositoryLayer = Layer.effect(
  UsersRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const getById = Effect.fn("PostgresUsersRepository.getById")(
      function* (id) {
        yield* Effect.annotateCurrentSpan({ "user.id": id })

        const rows = yield* sql<UserRow>`
        SELECT id, email, name
        FROM users
        WHERE id = ${id}
        LIMIT 1
      `.pipe(mapRepositoryError("UsersRepository", "getById"))

        return oneOrNull(rows, toUser)
      },
    )

    const findByEmail = Effect.fn("PostgresUsersRepository.findByEmail")(
      function* (email: string) {
        const rows = yield* sql<UserRow>`
          SELECT id, email, name
          FROM users
          WHERE email = ${email}
          LIMIT 1
        `.pipe(mapRepositoryError("UsersRepository", "findByEmail"))

        return oneOrNull(rows, toUser)
      },
    )

    const create = Effect.fn("PostgresUsersRepository.create")(
      function* (input) {
        const rows = yield* sql<UserRow>`
          INSERT INTO users (id, name, email)
          VALUES (${input.id}, ${input.name}, ${input.email})
          RETURNING id, email, name
        `.pipe(mapRepositoryError("UsersRepository", "create"))

        return yield* requireReadBack(
          oneOrNull(rows, toUser),
          repositoryError("create.returning"),
        )
      },
    )

    return UsersRepository.of({
      getById,
      findByEmail,
      create,
    })
  }),
)
