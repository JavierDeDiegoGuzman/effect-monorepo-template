import { Layer } from "effect"
import { SqliteLayer } from "../infra/sql/Sqlite"
import { SqlProjectsRepositoryLayer } from "../repositories/projects/SqlProjectsRepository"
import { SqlTodosRepositoryLayer } from "../repositories/todos/SqlTodosRepository"
import { SqlTransactionsLayer } from "../repositories/transactions/SqlTransactions"
import { SqlUsersRepositoryLayer } from "../repositories/users/SqlUsersRepository"
import { AuthTokensLive } from "../services/auth-tokens/AuthTokensLive"
import { PasswordsLive } from "../services/passwords/PasswordsLive"
import { ProjectsLive } from "../services/projects/ProjectsLive"
import { TodosLive } from "../services/todos/TodosLive"
import { UsersLive } from "../services/users/UsersLive"

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
