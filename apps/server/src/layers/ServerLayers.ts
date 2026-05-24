import type { Todo, User } from "@app/shared"
import { Layer } from "effect"
import type { ConfigError } from "effect/Config"
import type { PlatformError } from "effect/PlatformError"
import type { SqlError } from "effect/unstable/sql/SqlError"
import { PostgresLayer } from "../database/Postgres"
import { SqliteLayer } from "../database/Sqlite"
import type { Transactions } from "../database/transactions"
import { InMemoryTransactionsLayer } from "../database/transactions.memory"
import { SqlTransactionsLayer } from "../database/transactions.sql"
import {
  type AuthCredentialsRepository,
  AuthLive,
  AuthSessionCookiesLive,
  AuthTokensLive,
  makeInMemoryAuthCredentialsRepositoryLayer,
  PasswordsLive,
  PostgresAuthCredentialsRepositoryLayer,
  SqlAuthCredentialsRepositoryLayer,
} from "../modules/auth"
import {
  makeInMemoryTodosRepositoryLayer,
  PostgresTodosRepositoryLayer,
  SqlTodosRepositoryLayer,
  TodosLive,
  type TodosRepository,
} from "../modules/todos"
import {
  makeInMemoryUsersRepositoryLayer,
  PostgresUsersRepositoryLayer,
  SqlUsersRepositoryLayer,
  UsersLive,
  type UsersRepository,
} from "../modules/users"

export type InMemoryRepositorySeed = {
  readonly users?: ReadonlyArray<{
    readonly user: User
    readonly passwordHash: string
  }>
  readonly todos?: ReadonlyArray<Todo>
}

type RepositoryServices =
  | UsersRepository
  | TodosRepository
  | AuthCredentialsRepository
  | Transactions

type RepositoryLayerError = ConfigError | PlatformError | SqlError

export const makeSqliteRepositoryLayer = (sqliteLayer = SqliteLayer) =>
  Layer.mergeAll(
    SqlUsersRepositoryLayer,
    SqlTodosRepositoryLayer,
    SqlAuthCredentialsRepositoryLayer,
    SqlTransactionsLayer,
  ).pipe(Layer.provide(sqliteLayer))

export const makeInMemoryRepositoriesLayer = (
  seed: InMemoryRepositorySeed = {},
) =>
  Layer.mergeAll(
    makeInMemoryUsersRepositoryLayer(seed.users?.map((record) => record.user)),
    makeInMemoryTodosRepositoryLayer(seed.todos),
    makeInMemoryAuthCredentialsRepositoryLayer(
      seed.users?.map((record) => ({
        userId: record.user.id,
        passwordHash: record.passwordHash,
      })),
    ),
    InMemoryTransactionsLayer,
  )

export const MemoryRepositoriesLayer = makeInMemoryRepositoriesLayer()

export const PostgresRepositoriesLayer = Layer.mergeAll(
  PostgresUsersRepositoryLayer,
  PostgresTodosRepositoryLayer,
  PostgresAuthCredentialsRepositoryLayer,
  SqlTransactionsLayer,
).pipe(Layer.provide(PostgresLayer))

export const makeProductDomainLayer = (
  repositoryLayer: Layer.Layer<
    RepositoryServices,
    RepositoryLayerError
  > = PostgresRepositoriesLayer,
) => Layer.mergeAll(UsersLive, TodosLive).pipe(Layer.provide(repositoryLayer))

export const makeAuthDomainLayer = (
  repositoryLayer: Layer.Layer<
    RepositoryServices,
    RepositoryLayerError
  > = PostgresRepositoriesLayer,
  productDomainLayer = makeProductDomainLayer(repositoryLayer),
) =>
  AuthLive.pipe(
    Layer.provide(
      Layer.mergeAll(
        repositoryLayer,
        productDomainLayer,
        PasswordsLive,
        AuthTokensLive,
      ),
    ),
  )

export const makeDomainLayer = (
  repositoryLayer: Layer.Layer<
    RepositoryServices,
    RepositoryLayerError
  > = PostgresRepositoriesLayer,
) => {
  const productDomainLayer = makeProductDomainLayer(repositoryLayer)

  return Layer.mergeAll(
    productDomainLayer,
    makeAuthDomainLayer(repositoryLayer, productDomainLayer),
  )
}

export const makeHttpServerDependenciesLayer = (
  repositoryLayer: Layer.Layer<
    RepositoryServices,
    RepositoryLayerError
  > = PostgresRepositoriesLayer,
) => {
  const domainLayer = makeDomainLayer(repositoryLayer)

  return Layer.mergeAll(repositoryLayer, domainLayer, AuthSessionCookiesLive)
}

export const DevServerDependenciesLayer = makeHttpServerDependenciesLayer(
  makeSqliteRepositoryLayer(),
)

export const ProdServerDependenciesLayer = makeHttpServerDependenciesLayer(
  PostgresRepositoriesLayer,
)

export const HttpServerDependenciesLayer = ProdServerDependenciesLayer
