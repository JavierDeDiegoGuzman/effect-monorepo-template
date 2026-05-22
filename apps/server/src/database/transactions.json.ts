import { Layer } from "effect"
import { Transactions } from "./transactions"

export const JsonTransactionsLayer = Layer.succeed(
  Transactions,
  Transactions.of({
    // JSON repositories serialize each file update through JsonDatabase. Multi-step
    // domain transactions should move into JsonDatabase.update when needed.
    withTransaction: (effect) => effect,
  }),
)
