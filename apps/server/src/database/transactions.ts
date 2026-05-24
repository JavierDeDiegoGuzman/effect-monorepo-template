import { Context, type Effect } from "effect"
import type { RepositoryError } from "../errors/repository"

export class Transactions extends Context.Service<
  Transactions,
  {
    readonly withTransaction: <A, E, R>(
      effect: Effect.Effect<A, E, R>,
    ) => Effect.Effect<A, E | RepositoryError, R>
  }
>()("app/database/Transactions") {}
