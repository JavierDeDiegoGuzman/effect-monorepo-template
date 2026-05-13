import { type Effect, ServiceMap } from "effect"

export class Transactions extends ServiceMap.Service<
  Transactions,
  {
    readonly withTransaction: <A, E, R>(
      effect: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E, R>
  }
>()("app/repositories/Transactions") {}
