import { Todo } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { RepositoryError } from "../../errors/repository"
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
}

const toTodo = (row: TodoRow) =>
  new Todo({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    completed: row.completed === 1,
  })

const repositoryError = (operation: string) =>
  new RepositoryError({ repository: "TodosRepository", operation })

export const SqlTodosRepositoryLayer = Layer.effect(
  TodosRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const listByUser = Effect.fn("SqlTodosRepository.listByUser")(function* (
      userId: number,
    ) {
      yield* Effect.annotateCurrentSpan({ "user.id": userId })

      const rows = yield* sql<TodoRow>`
        SELECT id, user_id, title, completed
        FROM todos
        WHERE user_id = ${userId}
        ORDER BY id ASC
      `.pipe(Effect.mapError(() => repositoryError("listByUser")))

      return rows.map(toTodo)
    })

    const getByIdForUser = Effect.fn("SqlTodosRepository.getByIdForUser")(
      function* (userId: number, id: number) {
        yield* Effect.annotateCurrentSpan({ "user.id": userId, "todo.id": id })

        const rows = yield* sql<TodoRow>`
        SELECT id, user_id, title, completed
        FROM todos
        WHERE user_id = ${userId} AND id = ${id}
        LIMIT 1
      `.pipe(Effect.mapError(() => repositoryError("getByIdForUser")))

        const row = rows[0]
        return row === undefined ? null : toTodo(row)
      },
    )

    const createForUser = Effect.fn("SqlTodosRepository.createForUser")(
      function* (input: { readonly userId: number; readonly title: string }) {
        yield* Effect.annotateCurrentSpan({ "user.id": input.userId })

        const result = (yield* sql`
        INSERT INTO todos (user_id, title, completed)
        VALUES (${input.userId}, ${input.title}, 0)
      `.raw.pipe(
          Effect.mapError(() => repositoryError("createForUser")),
        )) as SqliteInsertResult

        return yield* getByIdForUser(input.userId, insertedIdFrom(result)).pipe(
          Effect.flatMap((todo) =>
            todo === null
              ? Effect.fail(repositoryError("createForUser.readBack"))
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
      yield* Effect.annotateCurrentSpan({
        "user.id": input.userId,
        "todo.id": input.id,
        "todo.completed": input.completed,
      })

      yield* sql`
        UPDATE todos
        SET completed = ${input.completed ? 1 : 0}
        WHERE user_id = ${input.userId} AND id = ${input.id}
      `.pipe(Effect.mapError(() => repositoryError("updateCompletedForUser")))
    })

    return TodosRepository.of({
      listByUser,
      getByIdForUser,
      createForUser,
      updateCompletedForUser,
    })
  }),
)
