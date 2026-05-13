import { NodeFileSystem } from "@effect/platform-node"
import { SqliteClient } from "@effect/sql-sqlite-node"
import { Effect, FileSystem, Layer, ServiceMap } from "effect"
import { Reactivity } from "effect/unstable/reactivity"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { initializeSqliteSchema } from "../../database/schema"

export const makeTestSqliteLayer = (options?: { readonly seed?: boolean }) =>
  Layer.effectServices(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const dir = yield* fs.makeTempDirectoryScoped()
      const client = yield* SqliteClient.make({ filename: `${dir}/test.db` })

      yield* initializeSqliteSchema({ seed: options?.seed ?? false }).pipe(
        Effect.provideService(SqlClient.SqlClient, client),
      )

      return ServiceMap.make(SqliteClient.SqliteClient, client).pipe(
        ServiceMap.add(SqlClient.SqlClient, client),
      )
    }),
  ).pipe(Layer.provide(Reactivity.layer), Layer.provide(NodeFileSystem.layer))

export const TestSqliteLayer = makeTestSqliteLayer()
