import { Layer } from "effect"
import { SqlProjectsRepositoryLayer } from "../../repositories/sql/SqlProjectsRepository"
import { SqlTodosRepositoryLayer } from "../../repositories/sql/SqlTodosRepository"
import { SqlTransactionsLayer } from "../../repositories/sql/SqlTransactions"
import { SqlUsersRepositoryLayer } from "../../repositories/sql/SqlUsersRepository"
import { makeTestSqliteLayer, TestSqliteLayer } from "./TestSqliteLayer"

export const makeSqlRepositoriesTestLayer = (options?: {
  readonly seed?: boolean
}) =>
  Layer.mergeAll(
    SqlUsersRepositoryLayer,
    SqlProjectsRepositoryLayer,
    SqlTodosRepositoryLayer,
    SqlTransactionsLayer,
  ).pipe(Layer.provide(makeTestSqliteLayer(options)))

export const SqlRepositoriesTestLayer = Layer.mergeAll(
  SqlUsersRepositoryLayer,
  SqlProjectsRepositoryLayer,
  SqlTodosRepositoryLayer,
  SqlTransactionsLayer,
).pipe(Layer.provide(TestSqliteLayer))
