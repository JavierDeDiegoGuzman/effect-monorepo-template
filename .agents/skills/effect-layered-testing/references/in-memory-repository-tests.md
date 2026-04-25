# In-memory Repository Tests

Use in-memory repositories to test domain services without SQL.

## Repository implementation

In-memory repositories should implement the same repository contract as SQL repositories.

Example:

```ts
export const makeInMemoryUsersRepositoryLayer = (
  initialRecords: ReadonlyArray<UserRecord> = [],
) =>
  Layer.effect(
    UsersRepository,
    Effect.gen(function* () {
      const store = yield* Ref.make(new Map(...))

      return UsersRepository.of({
        getById,
        getAuthByEmail,
        create
      })
    })
  )
```

## Rules

- Use the same repository contracts as production.
- Keep in-memory behavior close enough to production for domain tests.
- Seed using domain objects or repository DTOs, not SQL rows.
- Use `Ref` or scoped state per layer instance to avoid shared state across tests.
- Avoid global mutable maps.

## Missing records

Match repository contract behavior.

If SQL repository returns `null` for missing records, memory repository must also return `null`.

## Domain test example

```ts
it.effect("fails when email already exists", () =>
  Effect.gen(function* () {
    const users = yield* Users

    yield* users.create({
      name: "Alice",
      email: "alice@example.com",
      passwordHash: "hash"
    })

    const error = yield* users.create({
      name: "Alice Again",
      email: "ALICE@example.com",
      passwordHash: "hash2"
    }).pipe(Effect.flip)

    assert.strictEqual(error._tag, "UserAlreadyExists")
  }).pipe(Effect.provide(UsersDomainTestLayer))
)
```

## When to add in-memory implementations

Add an in-memory repository when:

- a domain service depends on a repository contract
- the domain service needs fast unit tests
- test setup with SQL would obscure the business behavior

Do not add an in-memory implementation just to bypass unclear layer composition. Fix the layer graph first.
