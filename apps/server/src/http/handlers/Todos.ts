import {
  Api,
  CurrentWorkspace,
  type ProjectNotFound,
  type TodoNotFound,
} from "@app/shared"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Todos } from "../../services/Todos"

export const TodosApiHandlers = HttpApiBuilder.group(
  Api,
  "todos",
  Effect.fn(function* (handlers) {
    const todos = yield* Todos

    return handlers
      .handle("list", () =>
        Effect.gen(function* () {
          const workspace = yield* CurrentWorkspace
          return yield* todos.listByWorkspace(workspace.id)
        }).pipe(
          Effect.annotateSpans({
            "http.route": "/todos",
            "http.method": "GET",
          }),
        ),
      )
      .handle("listByProject", ({ params }) =>
        Effect.gen(function* () {
          const workspace = yield* CurrentWorkspace
          return yield* todos.listByProjectInWorkspace(
            workspace.id,
            params.projectId,
          )
        }).pipe(
          Effect.annotateSpans({
            "http.route": "/projects/:projectId/todos",
            "http.method": "GET",
            "project.id": params.projectId,
          }),
        ),
      )
      .handle("getById", ({ params }) =>
        Effect.gen(function* () {
          const workspace = yield* CurrentWorkspace
          return yield* todos.getByIdInWorkspace(workspace.id, params.id)
        }).pipe(
          Effect.annotateSpans({
            "http.route": "/todos/:id",
            "http.method": "GET",
            "todo.id": params.id,
          }),
          Effect.catchTag("TodoNotFound", (error: TodoNotFound) =>
            Effect.fail(error),
          ),
        ),
      )
      .handle("create", ({ payload }) =>
        Effect.gen(function* () {
          const workspace = yield* CurrentWorkspace
          return yield* todos.createInWorkspace(workspace.id, payload)
        }).pipe(
          Effect.annotateSpans({
            "http.route": "/todos",
            "http.method": "POST",
            "todo.title.length": payload.title.length,
            "todo.project.id": payload.projectId ?? "none",
          }),
          Effect.catchTag("ProjectNotFound", (error: ProjectNotFound) =>
            Effect.fail(error),
          ),
        ),
      )
      .handle("update", ({ params, payload }) =>
        Effect.gen(function* () {
          const workspace = yield* CurrentWorkspace
          return yield* todos.updateInWorkspace(
            workspace.id,
            params.id,
            payload,
          )
        }).pipe(
          Effect.annotateSpans({
            "http.route": "/todos/:id",
            "http.method": "PATCH",
            "todo.id": params.id,
            "todo.completed": payload.completed,
          }),
          Effect.catchTag("TodoNotFound", (error: TodoNotFound) =>
            Effect.fail(error),
          ),
        ),
      )
  }),
)
