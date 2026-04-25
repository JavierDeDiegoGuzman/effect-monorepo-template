# Layer Composition

Layer graph should be explicit.

## Preferred graph

```txt
DatabaseInfraLayer
  ↓
SqlRepositoryLayer
  ↓
DomainLayer
  ↓
Http handlers
```

## Example

```ts
const RepositoryLayer = Layer.mergeAll(
  SqlUsersRepositoryLayer,
  SqlAccountsRepositoryLayer,
  SqlProjectsRepositoryLayer,
).pipe(
  Layer.provide(DatabaseLayer),
)

const CoreDomainLayer = Layer.mergeAll(
  Users.layer,
  Accounts.layer,
).pipe(
  Layer.provide(RepositoryLayer),
)

const ProjectDomainLayer = Projects.layer.pipe(
  Layer.provideMerge(CoreDomainLayer),
  Layer.provide(RepositoryLayer),
)

const DomainLayer = Layer.mergeAll(
  CoreDomainLayer,
  ProjectDomainLayer,
)

const AppDependenciesLayer = Layer.mergeAll(
  DatabaseLayer,
  RepositoryLayer,
  DomainLayer,
  AuthTokens.layer,
  Passwords.layer,
)
```

Use names that match the project. The important rule is that dependencies are provided intentionally, not hidden with casts.

## Avoid casts

Do not do this:

```ts
Layer.launch(AppLayer) as Effect.Effect<never, never, never>
```

If composition leaves unresolved requirements, fix the layer graph.

## Common mistakes

### Domain service still requires SQL

Cause:

- domain service calls `SqlClient.SqlClient`

Fix:

- move SQL access into repository
- introduce/use transaction abstraction for atomic orchestration

### Repository not provided with SQL

Cause:

```ts
const RepositoryLayer = Layer.mergeAll(SqlUsersRepositoryLayer)
```

Fix:

```ts
const RepositoryLayer = Layer.mergeAll(SqlUsersRepositoryLayer).pipe(
  Layer.provide(DatabaseLayer),
)
```

### Domain service dependencies are composed in the wrong order

A domain service may depend on another domain service when it represents orchestration or validation.

Example:

```txt
ChildModule service depends on ParentModule service to validate a reference.
```

In that case, provide the parent/core domain layer before the dependent service.

### Shared context becomes pairwise coupling

If many modules depend on the same account/tenant/workspace/organization context, compose that shared context/access layer once and provide it to dependent modules. Do not create a mesh of unrelated module dependencies.
