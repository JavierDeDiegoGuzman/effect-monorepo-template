import { Effect } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"

export const initializePostgresSchema = () =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL
      )
    `

    yield* sql`
      CREATE TABLE IF NOT EXISTS auth_credentials (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        password_hash TEXT NOT NULL
      )
    `

    yield* sql`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    yield* sql`
      CREATE INDEX IF NOT EXISTS todos_user_id_idx
      ON todos (user_id)
    `
  })
