import { dirname } from "node:path"
import { NodeFileSystem } from "@effect/platform-node"
import { SqliteClient } from "@effect/sql-sqlite-node"
import { Config, Context, Effect, FileSystem, Layer } from "effect"
import { Reactivity } from "effect/unstable/reactivity"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { runMigrations } from "./migrations"
import { seedDemoData } from "./seed"

type SqliteLayerOptions = {
  readonly migrate?: boolean
  readonly seed?: boolean
}

const make = (options: SqliteLayerOptions = {}) =>
  Effect.gen(function* () {
    const filename = yield* Config.nonEmptyString("SQLITE_FILENAME").pipe(
      Config.withDefault("./.data/app.db"),
    )
    const fs = yield* FileSystem.FileSystem
    const migrate = options.migrate ?? true
    const seed = options.seed ?? true

    yield* fs.makeDirectory(dirname(filename), { recursive: true })

    const client = yield* SqliteClient.make({ filename })

    yield* Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient
      yield* sql`PRAGMA foreign_keys = ON`
      if (migrate) {
        yield* runMigrations()
      }
      if (seed) {
        yield* seedDemoData
      }
    }).pipe(Effect.provideService(SqlClient.SqlClient, client))

    return Context.make(SqliteClient.SqliteClient, client).pipe(
      Context.add(SqlClient.SqlClient, client),
    )
  })

export const makeSqliteLayer = (options?: SqliteLayerOptions) =>
  Layer.effectContext(make(options)).pipe(
    Layer.provide(Reactivity.layer),
    Layer.provide(NodeFileSystem.layer),
  )

export const SqliteLayer = makeSqliteLayer()
