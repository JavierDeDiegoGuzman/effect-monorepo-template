import { NodeFileSystem } from "@effect/platform-node"
import { Effect, FileSystem, Layer } from "effect"
import { makeJsonDatabaseLayer } from "../../database/json"
import { JsonTransactionsLayer } from "../../database/transactions.json"
import { JsonTodosRepositoryLayer } from "../../modules/todos"
import { JsonUsersRepositoryLayer } from "../../modules/users"

export const makeJsonRepositoriesTestLayer = (options?: {
  readonly seed?: boolean
}) =>
  Layer.unwrap(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const dir = yield* fs.makeTempDirectoryScoped()
      const jsonDatabaseLayer = makeJsonDatabaseLayer({
        filename: `${dir}/test.json`,
        seed: options?.seed ?? false,
      })

      return Layer.mergeAll(
        JsonUsersRepositoryLayer,
        JsonTodosRepositoryLayer,
        JsonTransactionsLayer,
      ).pipe(Layer.provide(jsonDatabaseLayer))
    }),
  ).pipe(Layer.provide(NodeFileSystem.layer))

export const JsonRepositoriesTestLayer = makeJsonRepositoriesTestLayer()
