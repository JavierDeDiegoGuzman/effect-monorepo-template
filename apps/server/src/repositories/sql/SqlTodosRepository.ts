import { Todo } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { TodosRepository } from "../TodosRepository"

const insertedIdFrom = (result: unknown) =>
  Number(
    (result as { readonly lastInsertRowid: number | bigint }).lastInsertRowid,
  )

type TodoRow = {
  readonly id: number
  readonly workspace_id: number
  readonly title: string
  readonly completed: number
  readonly project_id: number | null
}

const toTodo = (row: TodoRow) =>
  new Todo({
    id: row.id,
    workspaceId: row.workspace_id,
    title: row.title,
    completed: row.completed === 1,
    projectId: row.project_id,
  })

export const SqlTodosRepositoryLayer = Layer.effect(
  TodosRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const listByWorkspace = Effect.fn("SqlTodosRepository.listByWorkspace")(
      function* (workspaceId: number) {
        const rows = yield* sql<TodoRow>`
        SELECT id, workspace_id, title, completed, project_id
        FROM todos
        WHERE workspace_id = ${workspaceId}
        ORDER BY id ASC
      `.pipe(Effect.orDie)

        return rows.map(toTodo)
      },
    )

    const listByProjectInWorkspace = Effect.fn(
      "SqlTodosRepository.listByProjectInWorkspace",
    )(function* (workspaceId: number, projectId: number) {
      const rows = yield* sql<TodoRow>`
        SELECT id, workspace_id, title, completed, project_id
        FROM todos
        WHERE workspace_id = ${workspaceId} AND project_id = ${projectId}
        ORDER BY id ASC
      `.pipe(Effect.orDie)

      return rows.map(toTodo)
    })

    const getByIdInWorkspace = Effect.fn(
      "SqlTodosRepository.getByIdInWorkspace",
    )(function* (workspaceId: number, id: number) {
      const rows = yield* sql<TodoRow>`
        SELECT id, workspace_id, title, completed, project_id
        FROM todos
        WHERE workspace_id = ${workspaceId} AND id = ${id}
        LIMIT 1
      `.pipe(Effect.orDie)

      const row = rows[0]
      return row === undefined ? null : toTodo(row)
    })

    const createInWorkspace = Effect.fn("SqlTodosRepository.createInWorkspace")(
      function* (input: {
        readonly workspaceId: number
        readonly title: string
        readonly projectId: number | null
      }) {
        const result = yield* sql`
        INSERT INTO todos (workspace_id, title, completed, project_id)
        VALUES (${input.workspaceId}, ${input.title}, 0, ${input.projectId})
      `.raw.pipe(Effect.orDie)

        return yield* getByIdInWorkspace(
          input.workspaceId,
          insertedIdFrom(result),
        ).pipe(
          Effect.flatMap((todo) =>
            todo === null
              ? Effect.die("Inserted todo not found")
              : Effect.succeed(todo),
          ),
        )
      },
    )

    const updateCompletedInWorkspace = Effect.fn(
      "SqlTodosRepository.updateCompletedInWorkspace",
    )(function* (input: {
      readonly workspaceId: number
      readonly id: number
      readonly completed: boolean
    }) {
      yield* sql`
        UPDATE todos
        SET completed = ${input.completed ? 1 : 0}
        WHERE workspace_id = ${input.workspaceId} AND id = ${input.id}
      `.pipe(Effect.orDie)
    })

    return TodosRepository.of({
      listByWorkspace,
      listByProjectInWorkspace,
      getByIdInWorkspace,
      createInWorkspace,
      updateCompletedInWorkspace,
    })
  }),
)
