import { Layer } from "effect"
import { Transactions } from "../Transactions"

export const InMemoryTransactionsLayer = Layer.succeed(
  Transactions,
  Transactions.of({
    withTransaction: (effect) => effect,
  }),
)
