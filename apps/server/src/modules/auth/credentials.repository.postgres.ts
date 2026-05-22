import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { AuthCredentialsRepository } from "./credentials.repository"

export const PostgresAuthCredentialsRepositoryLayer = Layer.effect(
  AuthCredentialsRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const findPasswordHashByUserId = Effect.fn(
      "PostgresAuthCredentialsRepository.findPasswordHashByUserId",
    )(function* (userId: number) {
      const rows = yield* sql<{ readonly password_hash: string }>`
        SELECT password_hash
        FROM auth_credentials
        WHERE user_id = ${userId}
        LIMIT 1
      `.pipe(Effect.orDie)

      return rows[0]?.password_hash ?? null
    })

    const createPasswordCredential = Effect.fn(
      "PostgresAuthCredentialsRepository.createPasswordCredential",
    )(function* (input: {
      readonly userId: number
      readonly passwordHash: string
    }) {
      yield* sql`
        INSERT INTO auth_credentials (user_id, password_hash)
        VALUES (${input.userId}, ${input.passwordHash})
      `.pipe(Effect.orDie)
    })

    return AuthCredentialsRepository.of({
      findPasswordHashByUserId,
      createPasswordCredential,
    })
  }),
)
