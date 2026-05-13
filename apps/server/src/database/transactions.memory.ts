import { Layer } from "effect"
import { Transactions } from "./transactions"

export const InMemoryTransactionsLayer = Layer.succeed(
  Transactions,
  Transactions.of({
    withTransaction: (effect) => effect,
  }),
)
