import { Todo } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { TodosRepository } from "./repository"

type TodoRow = {
  readonly id: number
  readonly user_id: number
  readonly title: string
  readonly completed: boolean
}

const toTodo = (row: TodoRow) =>
  new Todo({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    completed: row.completed,
  })

export const PostgresTodosRepositoryLayer = Layer.effect(
  TodosRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const listByUser = Effect.fn("PostgresTodosRepository.listByUser")(
      function* (userId: number) {
        const rows = yield* sql<TodoRow>`
          SELECT id, user_id, title, completed
          FROM todos
          WHERE user_id = ${userId}
          ORDER BY id ASC
        `.pipe(Effect.orDie)

        return rows.map(toTodo)
      },
    )

    const getByIdForUser = Effect.fn("PostgresTodosRepository.getByIdForUser")(
      function* (userId: number, id: number) {
        const rows = yield* sql<TodoRow>`
        SELECT id, user_id, title, completed
        FROM todos
        WHERE user_id = ${userId} AND id = ${id}
        LIMIT 1
      `.pipe(Effect.orDie)

        const row = rows[0]
        return row === undefined ? null : toTodo(row)
      },
    )

    const createForUser = Effect.fn("PostgresTodosRepository.createForUser")(
      function* (input: { readonly userId: number; readonly title: string }) {
        const rows = yield* sql<TodoRow>`
          INSERT INTO todos (user_id, title, completed)
          VALUES (${input.userId}, ${input.title}, FALSE)
          RETURNING id, user_id, title, completed
        `.pipe(Effect.orDie)

        const row = rows[0]
        return row === undefined
          ? yield* Effect.die("Inserted todo not returned")
          : toTodo(row)
      },
    )

    const updateCompletedForUser = Effect.fn(
      "PostgresTodosRepository.updateCompletedForUser",
    )(function* (input: {
      readonly userId: number
      readonly id: number
      readonly completed: boolean
    }) {
      yield* sql`
        UPDATE todos
        SET completed = ${input.completed}
        WHERE user_id = ${input.userId} AND id = ${input.id}
      `.pipe(Effect.orDie)
    })

    return TodosRepository.of({
      listByUser,
      getByIdForUser,
      createForUser,
      updateCompletedForUser,
    })
  }),
)
