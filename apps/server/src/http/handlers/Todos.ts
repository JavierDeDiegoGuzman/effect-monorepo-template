import { Api, type ProjectNotFound, type TodoNotFound } from "@app/shared"
import { Effect, Layer } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Projects } from "../../services/Projects"
import { Todos } from "../../services/Todos"

export const TodosApiHandlers = HttpApiBuilder.group(
  Api,
  "todos",
  Effect.fn(function* (handlers) {
    const todos = yield* Todos

    return handlers
      .handle("list", () =>
        todos.list.pipe(
          Effect.annotateSpans({
            "http.route": "/todos",
            "http.method": "GET",
          }),
        ),
      )
      .handle("listByProject", ({ params }) =>
        todos.listByProject(params.projectId).pipe(
          Effect.annotateSpans({
            "http.route": "/projects/:projectId/todos",
            "http.method": "GET",
            "project.id": params.projectId,
          }),
        ),
      )
      .handle("getById", ({ params }) =>
        todos.getById(params.id).pipe(
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
        todos.create(payload).pipe(
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
        todos.update(params.id, payload).pipe(
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
).pipe(Layer.provide(Todos.layer.pipe(Layer.provideMerge(Projects.layer))))
