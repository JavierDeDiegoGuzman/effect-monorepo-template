import { makeUserId, User } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { RepositoryError } from "../../errors/repository"
import { UsersRepository } from "./repository"

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

const repositoryError = (operation: string) =>
  new RepositoryError({ repository: "UsersRepository", operation })

export const SqlUsersRepositoryLayer = Layer.effect(
  UsersRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const getById = Effect.fn("SqlUsersRepository.getById")(function* (id) {
      yield* Effect.annotateCurrentSpan({ "user.id": id })

      const rows = yield* sql<UserRow>`
        SELECT id, email, name
        FROM users
        WHERE id = ${id}
        LIMIT 1
      `.pipe(Effect.mapError(() => repositoryError("getById")))

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
      `.pipe(Effect.mapError(() => repositoryError("findByEmail")))

      const row = rows[0]
      return row === undefined ? null : toUser(row)
    })

    const create = Effect.fn("SqlUsersRepository.create")(function* (input) {
      yield* sql`
        INSERT INTO users (id, name, email)
        VALUES (${input.id}, ${input.name}, ${input.email})
      `.pipe(Effect.mapError(() => repositoryError("create")))

      return yield* getById(input.id).pipe(
        Effect.flatMap((user) =>
          user === null
            ? Effect.fail(repositoryError("create.readBack"))
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
