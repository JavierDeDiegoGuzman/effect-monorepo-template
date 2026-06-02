import { TodosRepository } from "@app/backend-domain"
import { makeTodoId, makeUserId, Todo } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import {
  makeRepositoryError,
  mapRepositoryError,
  oneOrNull,
  requireReadBack,
} from "../../database/sqlRepositoryHelpers"

type TodoRow = {
  readonly id: string
  readonly user_id: string
  readonly title: string
  readonly completed: number
}

const toTodo = (row: TodoRow) =>
  new Todo({
    id: makeTodoId(row.id),
    userId: makeUserId(row.user_id),
    title: row.title,
    completed: row.completed === 1,
  })

const repositoryError = makeRepositoryError("TodosRepository")

export const SqlTodosRepositoryLayer = Layer.effect(
  TodosRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const listByUser = Effect.fn("SqlTodosRepository.listByUser")(
      function* (userId) {
        yield* Effect.annotateCurrentSpan({ "user.id": userId })

        const rows = yield* sql<TodoRow>`
        SELECT id, user_id, title, completed
        FROM todos
        WHERE user_id = ${userId}
        ORDER BY id ASC
      `.pipe(mapRepositoryError("TodosRepository", "listByUser"))

        return rows.map(toTodo)
      },
    )

    const getByIdForUser = Effect.fn("SqlTodosRepository.getByIdForUser")(
      function* (userId, id) {
        yield* Effect.annotateCurrentSpan({ "user.id": userId, "todo.id": id })

        const rows = yield* sql<TodoRow>`
        SELECT id, user_id, title, completed
        FROM todos
        WHERE user_id = ${userId} AND id = ${id}
        LIMIT 1
      `.pipe(mapRepositoryError("TodosRepository", "getByIdForUser"))

        return oneOrNull(rows, toTodo)
      },
    )

    const createForUser = Effect.fn("SqlTodosRepository.createForUser")(
      function* (input) {
        yield* Effect.annotateCurrentSpan({ "user.id": input.userId })

        yield* sql`
        INSERT INTO todos (id, user_id, title, completed)
        VALUES (${input.id}, ${input.userId}, ${input.title}, 0)
      `.pipe(mapRepositoryError("TodosRepository", "createForUser"))

        return yield* getByIdForUser(input.userId, input.id).pipe(
          Effect.flatMap((todo) =>
            requireReadBack(todo, repositoryError("createForUser.readBack")),
          ),
        )
      },
    )

    const updateCompletedForUser = Effect.fn(
      "SqlTodosRepository.updateCompletedForUser",
    )(function* (input) {
      yield* Effect.annotateCurrentSpan({
        "user.id": input.userId,
        "todo.id": input.id,
        "todo.completed": input.completed,
      })

      yield* sql`
        UPDATE todos
        SET completed = ${input.completed ? 1 : 0}
        WHERE user_id = ${input.userId} AND id = ${input.id}
      `.pipe(mapRepositoryError("TodosRepository", "updateCompletedForUser"))
    })

    return TodosRepository.of({
      listByUser,
      getByIdForUser,
      createForUser,
      updateCompletedForUser,
    })
  }),
)
