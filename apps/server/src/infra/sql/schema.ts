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
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL
      )
    `

    yield* sql`
      CREATE TABLE IF NOT EXISTS workspaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        kind TEXT NOT NULL
      )
    `

    yield* sql`
      CREATE TABLE IF NOT EXISTS workspace_members (
        workspace_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL UNIQUE,
        role TEXT NOT NULL,
        PRIMARY KEY (workspace_id, user_id),
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    yield* sql`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        archived INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        CHECK (archived IN (0, 1))
      )
    `

    yield* sql`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        project_id INTEGER,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
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
        INSERT INTO users (id, name, email, password_hash)
        VALUES
          (1, ${"Alice"}, ${"alice@example.com"}, ${"seed:alice"}),
          (2, ${"Bob"}, ${"bob@example.com"}, ${"seed:bob"})
      `

      yield* sql`
        INSERT INTO workspaces (id, name, kind)
        VALUES
          (1, ${"Alice Personal"}, ${"personal"}),
          (2, ${"Bob Personal"}, ${"personal"})
      `

      yield* sql`
        INSERT INTO workspace_members (workspace_id, user_id, role)
        VALUES
          (1, 1, ${"owner"}),
          (2, 2, ${"owner"})
      `

      yield* sql`
        INSERT INTO projects (id, workspace_id, name, description, archived)
        VALUES
          (1, 1, ${"Template"}, ${"Base setup and architecture work"}, 0),
          (2, 2, ${"Website"}, ${"Public web experience"}, 0)
      `

      yield* sql`
        INSERT INTO todos (id, workspace_id, title, completed, project_id)
        VALUES
          (1, 1, ${"Learn Effect HttpApi"}, 1, 1),
          (2, 2, ${"Build the webapp"}, 0, 2)
      `
    }).pipe(sql.withTransaction)
  })
