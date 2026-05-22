import { Context, type Effect } from "effect"

export class Transactions extends Context.Service<
  Transactions,
  {
    readonly withTransaction: <A, E, R>(
      effect: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>
  }
>()("app/database/Transactions") {}
