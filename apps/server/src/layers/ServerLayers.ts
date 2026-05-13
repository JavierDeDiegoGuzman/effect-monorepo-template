import { Layer } from "effect"
import { SqliteLayer } from "../database/Sqlite"
import { SqlTransactionsLayer } from "../database/transactions.sql"
import { AuthTokensLive, PasswordsLive } from "../modules/auth"
import { ProjectsLive, SqlProjectsRepositoryLayer } from "../modules/projects"
import { SqlTodosRepositoryLayer, TodosLive } from "../modules/todos"
import { SqlUsersRepositoryLayer, UsersLive } from "../modules/users"

export const makeRepositoryLayer = (sqliteLayer = SqliteLayer) =>
  Layer.mergeAll(
    SqlUsersRepositoryLayer,
    SqlProjectsRepositoryLayer,
    SqlTodosRepositoryLayer,
    SqlTransactionsLayer,
  ).pipe(Layer.provide(sqliteLayer))

export const makeDomainLayer = (repositoryLayer = makeRepositoryLayer()) => {
  const coreDomainLayer = Layer.mergeAll(UsersLive, ProjectsLive).pipe(
    Layer.provide(repositoryLayer),
  )

  const todosDomainLayer = TodosLive.pipe(
    Layer.provideMerge(coreDomainLayer),
    Layer.provide(repositoryLayer),
  )

  return Layer.mergeAll(coreDomainLayer, todosDomainLayer)
}

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
