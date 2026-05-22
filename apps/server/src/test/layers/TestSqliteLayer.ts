import { NodeFileSystem } from "@effect/platform-node"
import { SqliteClient } from "@effect/sql-sqlite-node"
import { Context, Effect, FileSystem, Layer } from "effect"
import { Reactivity } from "effect/unstable/reactivity"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { initializeSqliteSchema } from "../../database/schema"

export const makeTestSqliteLayer = (options?: { readonly seed?: boolean }) =>
  Layer.effectContext(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const dir = yield* fs.makeTempDirectoryScoped()
      const client = yield* SqliteClient.make({ filename: `${dir}/test.db` })

      yield* initializeSqliteSchema({ seed: options?.seed ?? false }).pipe(
        Effect.provideService(SqlClient.SqlClient, client),
      )

      return Context.make(SqliteClient.SqliteClient, client).pipe(
        Context.add(SqlClient.SqlClient, client),
      )
    }),
  ).pipe(Layer.provide(Reactivity.layer), Layer.provide(NodeFileSystem.layer))

export const TestSqliteLayer = makeTestSqliteLayer()
