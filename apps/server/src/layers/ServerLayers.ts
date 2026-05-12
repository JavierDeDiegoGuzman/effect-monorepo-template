import { Layer } from "effect"
import { SqliteLayer } from "../infra/sql/Sqlite"
import { SqlProjectsRepositoryLayer } from "../repositories/sql/SqlProjectsRepository"
import { SqlTodosRepositoryLayer } from "../repositories/sql/SqlTodosRepository"
import { SqlTransactionsLayer } from "../repositories/sql/SqlTransactions"
import { SqlUsersRepositoryLayer } from "../repositories/sql/SqlUsersRepository"
import { AuthTokens } from "../services/AuthTokens"
import { Passwords } from "../services/Passwords"
import { Projects } from "../services/Projects"
import { Todos } from "../services/Todos"
import { Users } from "../services/Users"

export const makeRepositoryLayer = (sqliteLayer = SqliteLayer) =>
  Layer.mergeAll(
    SqlUsersRepositoryLayer,
    SqlProjectsRepositoryLayer,
    SqlTodosRepositoryLayer,
    SqlTransactionsLayer,
  ).pipe(Layer.provide(sqliteLayer))

export const makeDomainLayer = (repositoryLayer = makeRepositoryLayer()) => {
  const coreDomainLayer = Layer.mergeAll(Users.layer, Projects.layer).pipe(
    Layer.provide(repositoryLayer),
  )

  const todosDomainLayer = Todos.layer.pipe(
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
    AuthTokens.layer,
    Passwords.layer,
  )
}

export const HttpServerDependenciesLayer = makeHttpServerDependenciesLayer()
