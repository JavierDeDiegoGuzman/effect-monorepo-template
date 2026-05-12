import {
  Api,
  CurrentUser,
  type ProjectNotFound,
  type TodoNotFound,
} from "@app/shared"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Todos } from "../../services/todos/Todos"

export const TodosApiHandlers = HttpApiBuilder.group(
  Api,
  "todos",
  Effect.fn(function* (handlers) {
    const todos = yield* Todos

    return handlers
      .handle("list", () =>
        Effect.gen(function* () {
          const user = yield* CurrentUser
          return yield* todos.listByUser(user.id)
        }).pipe(
          Effect.annotateSpans({
            "http.route": "/todos",
            "http.method": "GET",
          }),
        ),
      )
      .handle("listByProject", ({ params }) =>
        Effect.gen(function* () {
          const user = yield* CurrentUser
          return yield* todos.listByProjectForUser(user.id, params.projectId)
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
          const user = yield* CurrentUser
          return yield* todos.getByIdForUser(user.id, params.id)
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
          const user = yield* CurrentUser
          return yield* todos.createForUser(user.id, payload)
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
          const user = yield* CurrentUser
          return yield* todos.updateForUser(user.id, params.id, payload)
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
