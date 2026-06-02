import { makeUserId } from "@app/shared"
import { assert, describe, it } from "@effect/vitest"
import { Data, Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { makeTestSqliteLayer } from "../test/layers/TestSqliteLayer"
import { Transactions } from "@app/backend-domain"
import { SqlTransactionsLayer } from "./transactions.sql"

class ExpectedRollback extends Data.TaggedError("ExpectedRollback")<{
  readonly reason: "test-rollback"
}> {}

const TestSqliteLayer = makeTestSqliteLayer({ seed: false })

const TestLayer = Layer.mergeAll(
  TestSqliteLayer,
  SqlTransactionsLayer.pipe(Layer.provide(TestSqliteLayer)),
)

describe("SqlTransactions", () => {
  it.effect("rolls back writes when the wrapped effect fails", () =>
    Effect.gen(function* () {
      const transactions = yield* Transactions
      const sql = yield* SqlClient.SqlClient
      const userId = makeUserId("00000000-0000-4000-8000-000000000301")

      const error = yield* transactions
        .withTransaction(
          Effect.gen(function* () {
            yield* sql`
              INSERT INTO users (id, name, email)
              VALUES (${userId}, ${"Rollback User"}, ${"rollback@example.com"})
            `

            return yield* new ExpectedRollback({ reason: "test-rollback" })
          }),
        )
        .pipe(Effect.flip)

      const rows = yield* sql<{ readonly count: number }>`
        SELECT COUNT(*) as count
        FROM users
        WHERE id = ${userId}
      `

      assert.strictEqual(error._tag, "ExpectedRollback")
      assert.strictEqual(rows[0]?.count, 0)
    }).pipe(Effect.provide(TestLayer)),
  )
})
