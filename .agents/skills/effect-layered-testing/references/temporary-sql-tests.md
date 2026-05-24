# Temporary SQL Tests

Use temporary SQL databases for repository integration tests.

## Preferred approach

Create a fresh temporary database file through the platform filesystem:

```ts
export const makeTestSqliteLayer = (options?: { readonly seed?: boolean }) =>
  Layer.effectServices(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const dir = yield* fs.makeTempDirectoryScoped()
      const client = yield* SqliteClient.make({ filename: `${dir}/test.db` })

      yield* Effect.gen(function* () {
        yield* runMigrations()
        if (options?.seed ?? false) {
          yield* seedDemoData
        }
      }).pipe(Effect.provideService(SqlClient.SqlClient, client))

      return ServiceMap.make(SqliteClient.SqliteClient, client).pipe(
        ServiceMap.add(SqlClient.SqlClient, client)
      )
    })
  ).pipe(
    Layer.provide(Reactivity.layer),
    Layer.provide(NodeFileSystem.layer)
  )
```

## Why temporary files over dev DB

Temporary databases:

- isolate tests
- avoid data pollution
- are reproducible
- are safe to run in CI
- can test real SQLite behavior

## `:memory:` vs temp file

`:memory:` is fast and fine for simple tests, but temp files are usually safer for app-level SQL tests because they are closer to production behavior and work with filesystem-scoped lifecycle.

## Schema migrations

Schema setup should use the same migration runner in tests and production.

Good:

```txt
database/migrations.ts
database/migrations/*
database/seed.ts
```

```ts
export const runMigrations = Effect.fn("runMigrations")(function* () { ... })
export const seedDemoData = Effect.gen(function* () { ... })
```

Tests and production both call the same migration runner. Tests that inspect migration behavior can start with `makeTestSqliteLayer({ migrate: false })` and call `runMigrations()` manually.

## Seeding

Prefer tests to explicitly choose seeding:

```ts
makeTestSqliteLayer({ seed: false })
makeTestSqliteLayer({ seed: true })
makeTestSqliteLayer({ migrate: false }) // migration-runner tests only
```

Default for tests should usually be `migrate: true` and `seed: false`.

## Repository integration test example

```ts
it.effect("creates and loads a user", () =>
  Effect.gen(function* () {
    const repo = yield* UsersRepository

    const user = yield* repo.create({
      name: "Alice",
      email: "alice@example.com",
      passwordHash: "hash"
    })

    const loaded = yield* repo.getById(user.id)

    assert.deepStrictEqual(loaded, user)
  }).pipe(Effect.provide(SqlRepositoriesTestLayer))
)
```
