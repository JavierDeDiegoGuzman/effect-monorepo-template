import { Layer } from "effect"
import { SqlProjectsRepositoryLayer } from "../../repositories/sql/SqlProjectsRepository"
import { SqlTodosRepositoryLayer } from "../../repositories/sql/SqlTodosRepository"
import { SqlTransactionsLayer } from "../../repositories/sql/SqlTransactions"
import { SqlUsersRepositoryLayer } from "../../repositories/sql/SqlUsersRepository"
import { SqlWorkspacesRepositoryLayer } from "../../repositories/sql/SqlWorkspacesRepository"
import { makeTestSqliteLayer, TestSqliteLayer } from "./TestSqliteLayer"

export const makeSqlRepositoriesTestLayer = (options?: {
  readonly seed?: boolean
}) =>
  Layer.mergeAll(
    SqlUsersRepositoryLayer,
    SqlWorkspacesRepositoryLayer,
    SqlProjectsRepositoryLayer,
    SqlTodosRepositoryLayer,
    SqlTransactionsLayer,
  ).pipe(Layer.provide(makeTestSqliteLayer(options)))

export const SqlRepositoriesTestLayer = Layer.mergeAll(
  SqlUsersRepositoryLayer,
  SqlWorkspacesRepositoryLayer,
  SqlProjectsRepositoryLayer,
  SqlTodosRepositoryLayer,
  SqlTransactionsLayer,
).pipe(Layer.provide(TestSqliteLayer))
