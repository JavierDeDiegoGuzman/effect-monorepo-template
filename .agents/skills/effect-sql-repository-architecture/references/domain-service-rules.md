# Domain Service Rules

Domain services depend on repositories, not SQL.

## Good

```ts
const repo = yield* UsersRepository

const create = Effect.fn("Users.create")(function* (input) {
  const email = normalizeEmail(input.email)

  const existing = yield* repo.getAuthByEmail(email)
  if (existing !== null) {
    return yield* new UserAlreadyExists({ email })
  }

  return yield* repo.create({
    name: input.name.trim(),
    email,
    passwordHash: input.passwordHash
  })
})
```

## Bad

```ts
const sql = yield* SqlClient.SqlClient

const create = Effect.fn("Users.create")(function* (input) {
  yield* sql`INSERT INTO users ...`
})
```

## Domain owns

- normalization
- validation
- domain errors
- existence checks when needed for business meaning
- cross-repository orchestration

## Repository owns

- persistence queries
- converting DB rows to domain objects
- insert/update/delete mechanics

## Transactions

If one domain operation uses multiple repository calls that must be atomic, the domain service owns the transaction boundary.

For small apps, using SQL transaction directly in domain is acceptable:

```ts
yield* Effect.gen(function* () {
  // multiple repository calls
}).pipe(sql.withTransaction)
```

For larger apps, introduce:

```txt
TransactionRunner
UnitOfWork
```

and make domain depend on that instead of `SqlClient`.
