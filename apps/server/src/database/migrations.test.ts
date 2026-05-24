import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { makeTestSqliteLayer } from "../test/layers/TestSqliteLayer"
import { runMigrations } from "./migrations"
import { seedDemoData } from "./seed"

const UnmigratedSqliteLayer = makeTestSqliteLayer({ migrate: false })

describe("database migrations", () => {
  it.effect("runs pending migrations once and records them", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient

      const firstRun = yield* runMigrations()
      const secondRun = yield* runMigrations()

      const migrations = yield* sql<{
        readonly migration_id: number
        readonly name: string
      }>`
        SELECT migration_id, name
        FROM effect_sql_migrations
        ORDER BY migration_id
      `

      const userColumns = yield* sql<{ readonly name: string }>`
        PRAGMA table_info(users)
      `

      const todoIndexes = yield* sql<{ readonly name: string }>`
        PRAGMA index_list(todos)
      `

      assert.deepStrictEqual(firstRun, [[1, "initial"]])
      assert.deepStrictEqual(secondRun, [])
      assert.deepStrictEqual(migrations, [{ migration_id: 1, name: "initial" }])
      assert.ok(userColumns.some((column) => column.name === "email"))
      assert.ok(todoIndexes.some((index) => index.name === "todos_user_id_idx"))
    }).pipe(Effect.provide(UnmigratedSqliteLayer)),
  )

  it.effect("keeps demo seed data separate from schema migrations", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient

      yield* runMigrations()

      const beforeSeed = yield* sql<{ readonly count: number }>`
        SELECT COUNT(*) as count
        FROM users
      `

      yield* seedDemoData
      yield* seedDemoData

      const afterSeed = yield* sql<{ readonly count: number }>`
        SELECT COUNT(*) as count
        FROM users
      `

      assert.strictEqual(beforeSeed[0]?.count, 0)
      assert.strictEqual(afterSeed[0]?.count, 2)
    }).pipe(Effect.provide(UnmigratedSqliteLayer)),
  )
})
