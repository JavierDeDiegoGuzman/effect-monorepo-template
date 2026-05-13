import { Todo } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { TodosRepository } from "./repository"

type SqliteInsertResult = {
  readonly lastInsertRowid: number | bigint
}

const insertedIdFrom = (result: SqliteInsertResult) =>
  Number(result.lastInsertRowid)

type TodoRow = {
  readonly id: number
  readonly user_id: number
  readonly title: string
  readonly completed: number
  readonly project_id: number | null
}

const toTodo = (row: TodoRow) =>
  new Todo({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    completed: row.completed === 1,
    projectId: row.project_id,
  })

export const SqlTodosRepositoryLayer = Layer.effect(
  TodosRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const listByUser = Effect.fn("SqlTodosRepository.listByUser")(function* (
      userId: number,
    ) {
      const rows = yield* sql<TodoRow>`
        SELECT id, user_id, title, completed, project_id
        FROM todos
        WHERE user_id = ${userId}
        ORDER BY id ASC
      `.pipe(Effect.orDie)

      return rows.map(toTodo)
    })

    const listByProjectForUser = Effect.fn(
      "SqlTodosRepository.listByProjectForUser",
    )(function* (userId: number, projectId: number) {
      const rows = yield* sql<TodoRow>`
        SELECT id, user_id, title, completed, project_id
        FROM todos
        WHERE user_id = ${userId} AND project_id = ${projectId}
        ORDER BY id ASC
      `.pipe(Effect.orDie)

      return rows.map(toTodo)
    })

    const getByIdForUser = Effect.fn("SqlTodosRepository.getByIdForUser")(
      function* (userId: number, id: number) {
        const rows = yield* sql<TodoRow>`
        SELECT id, user_id, title, completed, project_id
        FROM todos
        WHERE user_id = ${userId} AND id = ${id}
        LIMIT 1
      `.pipe(Effect.orDie)

        const row = rows[0]
        return row === undefined ? null : toTodo(row)
      },
    )

    const createForUser = Effect.fn("SqlTodosRepository.createForUser")(
      function* (input: {
        readonly userId: number
        readonly title: string
        readonly projectId: number | null
      }) {
        const result = (yield* sql`
        INSERT INTO todos (user_id, title, completed, project_id)
        VALUES (${input.userId}, ${input.title}, 0, ${input.projectId})
      `.raw.pipe(Effect.orDie)) as SqliteInsertResult

        return yield* getByIdForUser(input.userId, insertedIdFrom(result)).pipe(
          Effect.flatMap((todo) =>
            todo === null
              ? Effect.die("Inserted todo not found")
              : Effect.succeed(todo),
          ),
        )
      },
    )

    const updateCompletedForUser = Effect.fn(
      "SqlTodosRepository.updateCompletedForUser",
    )(function* (input: {
      readonly userId: number
      readonly id: number
      readonly completed: boolean
    }) {
      yield* sql`
        UPDATE todos
        SET completed = ${input.completed ? 1 : 0}
        WHERE user_id = ${input.userId} AND id = ${input.id}
      `.pipe(Effect.orDie)
    })

    return TodosRepository.of({
      listByUser,
      listByProjectForUser,
      getByIdForUser,
      createForUser,
      updateCompletedForUser,
    })
  }),
)
