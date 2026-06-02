import {
  type AuthCredentialsRepository,
  type TodosRepository,
  type Transactions,
  type UsersRepository,
} from "@app/backend-domain"
import { Layer } from "effect"
import type { ConfigError } from "effect/Config"
import type { PlatformError } from "effect/PlatformError"
import type { MigrationError } from "effect/unstable/sql/Migrator"
import type { SqlError } from "effect/unstable/sql/SqlError"
import { PostgresLayer } from "./database/Postgres"
import { SqliteLayer } from "./database/Sqlite"
import { SqlTransactionsLayer } from "./database/transactions.sql"
import {
  PostgresAuthCredentialsRepositoryLayer,
  SqlAuthCredentialsRepositoryLayer,
} from "./modules/auth"
import {
  PostgresTodosRepositoryLayer,
  SqlTodosRepositoryLayer,
} from "./modules/todos"
import {
  PostgresUsersRepositoryLayer,
  SqlUsersRepositoryLayer,
} from "./modules/users"

export type SqlRepositoryServices =
  | UsersRepository
  | TodosRepository
  | AuthCredentialsRepository
  | Transactions

export type SqlRepositoryLayerError =
  | ConfigError
  | PlatformError
  | SqlError
  | MigrationError

export const makeSqliteRepositoryLayer = (sqliteLayer = SqliteLayer) =>
  Layer.mergeAll(
    SqlUsersRepositoryLayer,
    SqlTodosRepositoryLayer,
    SqlAuthCredentialsRepositoryLayer,
    SqlTransactionsLayer,
  ).pipe(Layer.provide(sqliteLayer))

export const PostgresRepositoriesLayer = Layer.mergeAll(
  PostgresUsersRepositoryLayer,
  PostgresTodosRepositoryLayer,
  PostgresAuthCredentialsRepositoryLayer,
  SqlTransactionsLayer,
).pipe(Layer.provide(PostgresLayer))
