import { RepositoryError, Transactions } from "@app/backend-domain"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"

export const SqlTransactionsLayer = Layer.effect(
  Transactions,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    return Transactions.of({
      withTransaction: (effect) =>
        effect.pipe(
          sql.withTransaction,
          Effect.catchTag("SqlError", () =>
            Effect.fail(
              new RepositoryError({
                repository: "Transactions",
                operation: "withTransaction",
              }),
            ),
          ),
        ),
    })
  }),
)
