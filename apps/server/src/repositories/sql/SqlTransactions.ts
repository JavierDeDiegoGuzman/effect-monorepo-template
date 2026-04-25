import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { Transactions } from "../Transactions"

export const SqlTransactionsLayer = Layer.effect(
  Transactions,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    return Transactions.of({
      withTransaction: (effect) =>
        effect.pipe(sql.withTransaction, Effect.orDie),
    })
  }),
)
