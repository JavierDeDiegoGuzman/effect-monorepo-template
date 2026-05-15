import { Layer } from "effect"
import { SqliteLayer } from "../database/Sqlite"
import { SqlTransactionsLayer } from "../database/transactions.sql"
import { AuthTokensLive, PasswordsLive } from "../modules/auth"
import { SqlTodosRepositoryLayer, TodosLive } from "../modules/todos"
import { SqlUsersRepositoryLayer, UsersLive } from "../modules/users"

export const makeRepositoryLayer = (sqliteLayer = SqliteLayer) =>
  Layer.mergeAll(
    SqlUsersRepositoryLayer,
    SqlTodosRepositoryLayer,
    SqlTransactionsLayer,
  ).pipe(Layer.provide(sqliteLayer))

export const makeDomainLayer = (repositoryLayer = makeRepositoryLayer()) =>
  Layer.mergeAll(UsersLive, TodosLive).pipe(Layer.provide(repositoryLayer))

export const makeHttpServerDependenciesLayer = (sqliteLayer = SqliteLayer) => {
  const repositoryLayer = makeRepositoryLayer(sqliteLayer)
  const domainLayer = makeDomainLayer(repositoryLayer)

  return Layer.mergeAll(
    sqliteLayer,
    repositoryLayer,
    domainLayer,
    AuthTokensLive,
    PasswordsLive,
  )
}

export const HttpServerDependenciesLayer = makeHttpServerDependenciesLayer()
