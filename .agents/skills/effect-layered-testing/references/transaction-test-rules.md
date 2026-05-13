# Transaction Test Rules

Domain services should not depend directly on SQL just to run transactional operations.

## Use a transaction abstraction

Define a small service near repository contracts:

```ts
export class Transactions extends ServiceMap.Service<
  Transactions,
  {
    readonly withTransaction: <A, E, R>(
      effect: Effect.Effect<A, E, R>
    ) => Effect.Effect<A, E, R>
  }
>()("app/database/Transactions") {}
```

## SQL implementation

```ts
export const SqlTransactionsLayer = Layer.effect(
  Transactions,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    return Transactions.of({
      withTransaction: (effect) => effect.pipe(sql.withTransaction, Effect.orDie)
    })
  })
)
```

## In-memory implementation

```ts
export const InMemoryTransactionsLayer = Layer.succeed(
  Transactions,
  Transactions.of({
    withTransaction: (effect) => effect
  })
)
```

## Domain service usage

```ts
const transactions = yield* Transactions

return yield* Effect.gen(function* () {
  const workspace = yield* workspacesRepository.create(...)
  yield* workspacesRepository.createMembership(...)
  return workspace
}).pipe(transactions.withTransaction)
```

## Rules

- Domain services may depend on `Transactions`.
- Domain services should not depend on `SqlClient.SqlClient` for transaction handling.
- SQL repositories and SQL transaction implementation may require `SqlClient.SqlClient`.
- In-memory tests should provide `InMemoryTransactionsLayer`.
- SQL integration tests should provide `SqlTransactionsLayer`.
