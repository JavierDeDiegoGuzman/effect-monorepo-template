# SQL Layer Rules

SQL implementations require `SqlClient.SqlClient`.

## SQL repository implementation

SQL repository layers provide repository contracts and keep SQL details local.

```ts
export const SqlProjectsRepositoryLayer = Layer.effect(
  ProjectsRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const listByAccount = Effect.fn("SqlProjectsRepository.listByAccount")(
      function* (accountId: number) {
        const rows = yield* sql<ProjectRow>`
          SELECT id, account_id, name
          FROM projects
          WHERE account_id = ${accountId}
          ORDER BY id DESC
        `.pipe(Effect.orDie)

        return rows.map(toProject)
      },
    )

    return ProjectsRepository.of({
      listByAccount,
    })
  }),
)
```

The scope name should match the product domain: tenant, account, workspace, organization, project, etc.

## Row types

SQL row types belong in SQL implementation files.

Good:

```ts
type ProjectRow = {
  readonly id: number
  readonly account_id: number
  readonly name: string
}
```

Do not expose SQL row types through repository contracts or shared API schemas.

## Mappers

Keep mappers close to row types:

```ts
const toProject = (row: ProjectRow) =>
  new Project({
    id: row.id,
    accountId: row.account_id,
    name: row.name,
  })
```

Mappers translate persistence shape to domain/shared shape. They should not implement business rules.

## Insert IDs

For SQLite-style insert results, use a small local helper rather than repeating broad casts everywhere:

```ts
const insertedIdFrom = (result: unknown) =>
  Number((result as { readonly lastInsertRowid: number | bigint }).lastInsertRowid)
```

Prefer database-specific helpers or returning clauses when available.

## Schema and migrations

Database schema and migrations belong in infrastructure, not repositories.

Good:

```txt
infra/sql/schema.ts
infra/sql/migrations/*
```

Bad:

```txt
repositories/sql/SqlUsersRepository.ts creates tables
```

## Constraints and indexes

Use database constraints to protect integrity, but keep domain meaning in domain services.

Typical constraints:

- foreign keys for required references
- nullable foreign keys for optional references
- scoped unique indexes for names/slugs/codes unique inside a product context
- indexes for common scoped reads

Do not rely on constraints as the only expression of business behavior when clients need typed domain errors.
