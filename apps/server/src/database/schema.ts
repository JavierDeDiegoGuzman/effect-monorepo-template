import { Effect } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"

const seedIds: Readonly<{
  alice: string
  bob: string
  aliceTodo: string
  bobTodo: string
}> = {
  alice: "00000000-0000-4000-8000-000000000001",
  bob: "00000000-0000-4000-8000-000000000002",
  aliceTodo: "00000000-0000-4000-8000-000000000101",
  bobTodo: "00000000-0000-4000-8000-000000000102",
}

export const initializeSqliteSchema = (options?: { readonly seed?: boolean }) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const seed = options?.seed ?? true

    yield* sql`PRAGMA foreign_keys = ON`

    yield* sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL
      )
    `

    yield* sql`
      CREATE TABLE IF NOT EXISTS auth_credentials (
        user_id TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    yield* sql`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CHECK (completed IN (0, 1))
      )
    `

    if (!seed) {
      return
    }

    const [{ count }] = yield* sql<{
      count: number
    }>`SELECT COUNT(*) as count FROM users`

    if (count > 0) {
      return
    }

    yield* Effect.gen(function* () {
      yield* sql`
        INSERT INTO users (id, name, email)
        VALUES
          (${seedIds.alice}, ${"Alice"}, ${"alice@example.com"}),
          (${seedIds.bob}, ${"Bob"}, ${"bob@example.com"})
      `

      yield* sql`
        INSERT INTO auth_credentials (user_id, password_hash)
        VALUES
          (${seedIds.alice}, ${"seed:alice"}),
          (${seedIds.bob}, ${"seed:bob"})
      `

      yield* sql`
        INSERT INTO todos (id, user_id, title, completed)
        VALUES
          (${seedIds.aliceTodo}, ${seedIds.alice}, ${"Learn Effect HttpApi"}, 1),
          (${seedIds.bobTodo}, ${seedIds.bob}, ${"Build the webapp"}, 0)
      `
    }).pipe(sql.withTransaction)
  })
