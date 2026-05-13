import { Layer } from "effect"
import { SqlProjectsRepositoryLayer } from "../../repositories/projects/SqlProjectsRepository"
import { SqlTodosRepositoryLayer } from "../../repositories/todos/SqlTodosRepository"
import { SqlTransactionsLayer } from "../../repositories/transactions/SqlTransactions"
import { SqlUsersRepositoryLayer } from "../../repositories/users/SqlUsersRepository"
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
