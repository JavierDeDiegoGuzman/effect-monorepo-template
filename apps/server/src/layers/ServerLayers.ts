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
  InMemoryAuthCredentialsRepositoryLayer,
  PasswordsLive,
  PostgresAuthCredentialsRepositoryLayer,
  SqlAuthCredentialsRepositoryLayer,
} from "../modules/auth"
import {
  InMemoryTodosRepositoryLayer,
  PostgresTodosRepositoryLayer,
  SqlTodosRepositoryLayer,
  TodosLive,
  type TodosRepository,
} from "../modules/todos"
import {
  InMemoryUsersRepositoryLayer,
  PostgresUsersRepositoryLayer,
  SqlUsersRepositoryLayer,
  UsersLive,
  type UsersRepository,
} from "../modules/users"

export const makeSqliteRepositoryLayer = (sqliteLayer = SqliteLayer) =>
  Layer.mergeAll(
    SqlUsersRepositoryLayer,
    SqlTodosRepositoryLayer,
    SqlAuthCredentialsRepositoryLayer,
    SqlTransactionsLayer,
  ).pipe(Layer.provide(sqliteLayer))

export const MemoryRepositoriesLayer = Layer.mergeAll(
  InMemoryUsersRepositoryLayer,
  InMemoryTodosRepositoryLayer,
  InMemoryAuthCredentialsRepositoryLayer,
  InMemoryTransactionsLayer,
)

export const PostgresRepositoriesLayer = Layer.mergeAll(
  PostgresUsersRepositoryLayer,
  PostgresTodosRepositoryLayer,
  PostgresAuthCredentialsRepositoryLayer,
  SqlTransactionsLayer,
).pipe(Layer.provide(PostgresLayer))

type RepositoryServices =
  | UsersRepository
  | TodosRepository
  | AuthCredentialsRepository
  | Transactions

type RepositoryLayerError = ConfigError | PlatformError | SqlError

export const makeDomainLayer = (
  repositoryLayer: Layer.Layer<
    RepositoryServices,
    RepositoryLayerError
  > = PostgresRepositoriesLayer,
) => {
  const usersAndTodosLayer = Layer.mergeAll(UsersLive, TodosLive).pipe(
    Layer.provide(repositoryLayer),
  )
  const authDependenciesLayer = Layer.mergeAll(
    repositoryLayer,
    usersAndTodosLayer,
    PasswordsLive,
    AuthTokensLive,
  )

  return Layer.mergeAll(
    usersAndTodosLayer,
    AuthLive.pipe(Layer.provide(authDependenciesLayer)),
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
