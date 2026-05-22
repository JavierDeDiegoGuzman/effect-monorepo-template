import { Layer } from "effect"
import type { ConfigError } from "effect/Config"
import type { PlatformError } from "effect/PlatformError"
import type { SqlError } from "effect/unstable/sql/SqlError"
import { JsonDatabaseLayer } from "../database/json"
import { PostgresLayer } from "../database/Postgres"
import { SqliteLayer } from "../database/Sqlite"
import type { Transactions } from "../database/transactions"
import { JsonTransactionsLayer } from "../database/transactions.json"
import { InMemoryTransactionsLayer } from "../database/transactions.memory"
import { SqlTransactionsLayer } from "../database/transactions.sql"
import { AuthTokensLive, PasswordsLive } from "../modules/auth"
import {
  DrizzlePostgresTodosRepositoryLayer,
  InMemoryTodosRepositoryLayer,
  JsonTodosRepositoryLayer,
  PostgresTodosRepositoryLayer,
  SqlTodosRepositoryLayer,
  TodosLive,
  type TodosRepository,
} from "../modules/todos"
import {
  DrizzlePostgresUsersRepositoryLayer,
  InMemoryUsersRepositoryLayer,
  JsonUsersRepositoryLayer,
  PostgresUsersRepositoryLayer,
  SqlUsersRepositoryLayer,
  UsersLive,
  type UsersRepository,
} from "../modules/users"

export const makeSqliteRepositoryLayer = (sqliteLayer = SqliteLayer) =>
  Layer.mergeAll(
    SqlUsersRepositoryLayer,
    SqlTodosRepositoryLayer,
    SqlTransactionsLayer,
  ).pipe(Layer.provide(sqliteLayer))

export const MemoryRepositoriesLayer = Layer.mergeAll(
  InMemoryUsersRepositoryLayer,
  InMemoryTodosRepositoryLayer,
  InMemoryTransactionsLayer,
)

export const JsonRepositoriesLayer = Layer.mergeAll(
  JsonUsersRepositoryLayer,
  JsonTodosRepositoryLayer,
  JsonTransactionsLayer,
).pipe(Layer.provide(JsonDatabaseLayer))

export const RawPostgresRepositoriesLayer = Layer.mergeAll(
  PostgresUsersRepositoryLayer,
  PostgresTodosRepositoryLayer,
  SqlTransactionsLayer,
).pipe(Layer.provide(PostgresLayer))

export const PostgresRepositoriesLayer = Layer.mergeAll(
  DrizzlePostgresUsersRepositoryLayer,
  DrizzlePostgresTodosRepositoryLayer,
  SqlTransactionsLayer,
).pipe(Layer.provide(PostgresLayer))

type RepositoryServices = UsersRepository | TodosRepository | Transactions

type RepositoryLayerError = ConfigError | PlatformError | SqlError

export const makeDomainLayer = (
  repositoryLayer: Layer.Layer<
    RepositoryServices,
    RepositoryLayerError
  > = PostgresRepositoriesLayer,
) => Layer.mergeAll(UsersLive, TodosLive).pipe(Layer.provide(repositoryLayer))

export const makeHttpServerDependenciesLayer = (
  repositoryLayer: Layer.Layer<
    RepositoryServices,
    RepositoryLayerError
  > = PostgresRepositoriesLayer,
) => {
  const domainLayer = makeDomainLayer(repositoryLayer)

  return Layer.mergeAll(
    repositoryLayer,
    domainLayer,
    AuthTokensLive,
    PasswordsLive,
  )
}

export const DevServerDependenciesLayer = makeHttpServerDependenciesLayer(
  JsonRepositoriesLayer,
)

export const ProdServerDependenciesLayer = makeHttpServerDependenciesLayer(
  PostgresRepositoriesLayer,
)

export const HttpServerDependenciesLayer = ProdServerDependenciesLayer
