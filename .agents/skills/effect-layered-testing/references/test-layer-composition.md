# Test Layer Composition

Compose test layers explicitly around the layer under test.

## In-memory repositories layer

```ts
export const makeInMemoryRepositoriesLayer = (seed = {}) =>
  Layer.mergeAll(
    makeInMemoryUsersRepositoryLayer(seed.users),
    makeInMemoryWorkspacesRepositoryLayer(seed.workspaces),
    makeInMemoryProjectsRepositoryLayer(seed.projects),
    makeInMemoryTodosRepositoryLayer(seed.todos),
    InMemoryTransactionsLayer
  )
```

## SQL repositories test layer

```ts
export const makeSqlRepositoriesTestLayer = (options?: { seed?: boolean }) =>
  Layer.mergeAll(
    SqlUsersRepositoryLayer,
    SqlWorkspacesRepositoryLayer,
    SqlProjectsRepositoryLayer,
    SqlTodosRepositoryLayer,
    SqlTransactionsLayer
  ).pipe(
    Layer.provide(makeTestSqliteLayer(options))
  )
```

## Domain test layer

If services depend on one another, compose core services first.

Example: `Todos` depends on `Projects`.

```ts
const makeDomainLayer = (repositoriesLayer) => {
  const coreDomainLayer = Layer.mergeAll(
    Users.layer,
    Workspaces.layer,
    Projects.layer
  ).pipe(
    Layer.provide(repositoriesLayer)
  )

  const todosDomainLayer = Todos.layer.pipe(
    Layer.provideMerge(coreDomainLayer),
    Layer.provide(repositoriesLayer)
  )

  return Layer.mergeAll(coreDomainLayer, todosDomainLayer)
}
```

## Test usage

Domain unit test:

```ts
Effect.provide(makeInMemoryDomainTestLayer({ projects: [project] }))
```

SQL repository test:

```ts
Effect.provide(makeSqlRepositoriesTestLayer({ seed: false }))
```

Domain + SQL integration test:

```ts
Effect.provide(makeSqlDomainTestLayer({ seed: true }))
```

## Avoid

Avoid broad layer types or casts when possible. If type constraints are hard to express, prefer small concrete test layers per service over an overly generic helper.

Good:

```ts
const UsersDomainTestLayer = Users.layer.pipe(
  Layer.provide(makeInMemoryRepositoriesLayer())
)
```

Also acceptable for reusable helpers:

```ts
type RepositoriesLayer = Layer.Layer<Repositories, any, never>
```

Bad:

```ts
Layer.launch(AppLayer) as Effect.Effect<never, never, never>
```
