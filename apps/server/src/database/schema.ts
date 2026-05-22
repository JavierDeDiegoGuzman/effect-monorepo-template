import { Effect } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"

export const initializeSqliteSchema = (options?: { readonly seed?: boolean }) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const seed = options?.seed ?? true

    yield* sql`PRAGMA foreign_keys = ON`

    yield* sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL
      )
    `

    yield* sql`
      CREATE TABLE IF NOT EXISTS auth_credentials (
        user_id INTEGER PRIMARY KEY,
        password_hash TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    yield* sql`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
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
          (1, ${"Alice"}, ${"alice@example.com"}),
          (2, ${"Bob"}, ${"bob@example.com"})
      `

      yield* sql`
        INSERT INTO auth_credentials (user_id, password_hash)
        VALUES
          (1, ${"seed:alice"}),
          (2, ${"seed:bob"})
      `

      yield* sql`
        INSERT INTO todos (id, user_id, title, completed)
        VALUES
          (1, 1, ${"Learn Effect HttpApi"}, 1),
          (2, 2, ${"Build the webapp"}, 0)
      `
    }).pipe(sql.withTransaction)
  })
