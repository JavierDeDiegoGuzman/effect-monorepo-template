import { Layer } from "effect"
import { SqlTransactionsLayer } from "../../database/transactions.sql"
import { SqlAuthCredentialsRepositoryLayer } from "../../modules/auth"
import { SqlTodosRepositoryLayer } from "../../modules/todos"
import { SqlUsersRepositoryLayer } from "../../modules/users"
import { makeTestSqliteLayer, TestSqliteLayer } from "./TestSqliteLayer"

export const makeSqlRepositoriesTestLayer = (options?: {
  readonly seed?: boolean
}) =>
  Layer.mergeAll(
    SqlUsersRepositoryLayer,
    SqlTodosRepositoryLayer,
    SqlAuthCredentialsRepositoryLayer,
    SqlTransactionsLayer,
  ).pipe(Layer.provide(makeTestSqliteLayer(options)))

export const SqlRepositoriesTestLayer = Layer.mergeAll(
  SqlUsersRepositoryLayer,
  SqlTodosRepositoryLayer,
  SqlAuthCredentialsRepositoryLayer,
  SqlTransactionsLayer,
).pipe(Layer.provide(TestSqliteLayer))
