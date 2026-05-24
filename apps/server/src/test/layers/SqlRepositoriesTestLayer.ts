import { makeSqliteRepositoryLayer } from "../../layers/ServerLayers"
import { makeTestSqliteLayer, TestSqliteLayer } from "./TestSqliteLayer"

export const makeSqlRepositoriesTestLayer = (options?: {
  readonly seed?: boolean
}) => makeSqliteRepositoryLayer(makeTestSqliteLayer(options))

export const SqlRepositoriesTestLayer =
  makeSqliteRepositoryLayer(TestSqliteLayer)
