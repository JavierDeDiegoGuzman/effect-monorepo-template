import { dirname } from "node:path"
import { NodeFileSystem } from "@effect/platform-node"
import { SqliteClient } from "@effect/sql-sqlite-node"
import { Effect, FileSystem, Layer, ServiceMap } from "effect"
import { Reactivity } from "effect/unstable/reactivity"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { getSqliteConfig } from "./config"
import { initializeSqliteSchema } from "./schema"

const make = Effect.gen(function* () {
  const { filename } = yield* getSqliteConfig
  const fs = yield* FileSystem.FileSystem

  yield* fs.makeDirectory(dirname(filename), { recursive: true })

  const client = yield* SqliteClient.make({ filename })

  yield* initializeSqliteSchema().pipe(
    Effect.provideService(SqlClient.SqlClient, client),
  )

  return ServiceMap.make(SqliteClient.SqliteClient, client).pipe(
    ServiceMap.add(SqlClient.SqlClient, client),
  )
})

export const SqliteLayer = Layer.effectServices(make).pipe(
  Layer.provide(Reactivity.layer),
  Layer.provide(NodeFileSystem.layer),
)
