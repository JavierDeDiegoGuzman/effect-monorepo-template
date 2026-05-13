import { Layer } from "effect"
import { Transactions } from "./Transactions"

export const JsonTransactionsLayer = Layer.succeed(
  Transactions,
  Transactions.of({
    withTransaction: (effect) => effect,
  }),
)
