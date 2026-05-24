import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { RepositoryError } from "../../errors/repository"
import { AuthCredentialsRepository } from "./credentials.repository"

const repositoryError = (operation: string) =>
  new RepositoryError({ repository: "AuthCredentialsRepository", operation })

export const SqlAuthCredentialsRepositoryLayer = Layer.effect(
  AuthCredentialsRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const findPasswordHashByUserId = Effect.fn(
      "SqlAuthCredentialsRepository.findPasswordHashByUserId",
    )(function* (userId) {
      yield* Effect.annotateCurrentSpan({ "user.id": userId })

      const rows = yield* sql<{ readonly password_hash: string }>`
        SELECT password_hash
        FROM auth_credentials
        WHERE user_id = ${userId}
        LIMIT 1
      `.pipe(Effect.mapError(() => repositoryError("findPasswordHashByUserId")))

      return rows[0]?.password_hash ?? null
    })

    const createPasswordCredential = Effect.fn(
      "SqlAuthCredentialsRepository.createPasswordCredential",
    )(function* (input) {
      yield* Effect.annotateCurrentSpan({ "user.id": input.userId })

      yield* sql`
        INSERT INTO auth_credentials (user_id, password_hash)
        VALUES (${input.userId}, ${input.passwordHash})
      `.pipe(Effect.mapError(() => repositoryError("createPasswordCredential")))
    })

    return AuthCredentialsRepository.of({
      findPasswordHashByUserId,
      createPasswordCredential,
    })
  }),
)
