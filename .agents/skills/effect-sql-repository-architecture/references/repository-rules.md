# Repository Rules

Repositories are Effect services.

## Contract files

Repository contracts live outside specific implementations.

Good:

```txt
repositories/UsersRepository.ts
repositories/ProjectsRepository.ts
```

Bad:

```txt
repositories/sql/UsersRepository.ts
```

## Naming

Use:

```ts
export class UsersRepository extends ServiceMap.Service<...>()(
  "app/repositories/UsersRepository"
) {}
```

SQL implementation:

```ts
export const SqlUsersRepositoryLayer = Layer.effect(
  UsersRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    // ...
  })
)
```

## Contract design

Repository methods should expose domain concepts, not SQL row shapes.

Good:

```ts
readonly getById: (id: number) => Effect.Effect<User | null>
readonly create: (input: CreateUserRecord) => Effect.Effect<User>
```

Bad:

```ts
readonly getById: (id: number) => Effect.Effect<UserRow[]>
readonly runQuery: (sql: string) => Effect.Effect<unknown>
```

## Missing records

Repositories should usually return `null` for missing records.

Domain services convert that to domain errors.

Repository:

```ts
getById(id): Effect<User | null>
```

Domain service:

```ts
const user = yield* repo.getById(id)
if (user === null) {
  return yield* new UserNotFound({ id })
}
```

## Errors

Prefer:

- domain errors in domain services
- storage defects or storage-specific errors in repository implementations

Do not leak SQL errors into shared domain contracts unless explicitly desired.
