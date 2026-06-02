import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import {
  firstColumnOrNull,
  mapRepositoryError,
} from "../../database/sqlRepositoryHelpers"
import { AuthCredentialsRepository } from "@app/backend-domain"

export const PostgresAuthCredentialsRepositoryLayer = Layer.effect(
  AuthCredentialsRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const findPasswordHashByUserId = Effect.fn(
      "PostgresAuthCredentialsRepository.findPasswordHashByUserId",
    )(function* (userId) {
      yield* Effect.annotateCurrentSpan({ "user.id": userId })

      const rows = yield* sql<{ readonly password_hash: string }>`
        SELECT password_hash
        FROM auth_credentials
        WHERE user_id = ${userId}
        LIMIT 1
      `.pipe(
        mapRepositoryError(
          "AuthCredentialsRepository",
          "findPasswordHashByUserId",
        ),
      )

      return firstColumnOrNull(rows, "password_hash")
    })

    const createPasswordCredential = Effect.fn(
      "PostgresAuthCredentialsRepository.createPasswordCredential",
    )(function* (input) {
      yield* Effect.annotateCurrentSpan({ "user.id": input.userId })

      yield* sql`
        INSERT INTO auth_credentials (user_id, password_hash)
        VALUES (${input.userId}, ${input.passwordHash})
      `.pipe(
        mapRepositoryError(
          "AuthCredentialsRepository",
          "createPasswordCredential",
        ),
      )
    })

    return AuthCredentialsRepository.of({
      findPasswordHashByUserId,
      createPasswordCredential,
    })
  }),
)
