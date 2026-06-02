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

export const seedDemoData = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  const [{ count }] = yield* sql<{ readonly count: number }>`
    SELECT COUNT(*) as count
    FROM users
  `

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

    yield* sql.onDialectOrElse({
      pg: () => sql`
        INSERT INTO todos (id, user_id, title, completed)
        VALUES
          (${seedIds.aliceTodo}, ${seedIds.alice}, ${"Learn Effect HttpApi"}, ${true}),
          (${seedIds.bobTodo}, ${seedIds.bob}, ${"Build the webapp"}, ${false})
      `,
      orElse: () => sql`
        INSERT INTO todos (id, user_id, title, completed)
        VALUES
          (${seedIds.aliceTodo}, ${seedIds.alice}, ${"Learn Effect HttpApi"}, 1),
          (${seedIds.bobTodo}, ${seedIds.bob}, ${"Build the webapp"}, 0)
      `,
    })
  }).pipe(sql.withTransaction)
})
