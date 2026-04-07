import { Api, TodoNotFound } from "@app/shared"
import { Effect, Layer } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Todos } from "../../services/Todos"

export const TodosApiHandlers = HttpApiBuilder.group(
  Api,
  "todos",
  Effect.fn(function*(handlers) {
    const todos = yield* Todos

    return handlers
      .handle("list", () => todos.list)
      .handle("getById", ({ params }) =>
        todos.getById(params.id).pipe(
          Effect.catchTag("TodoNotFound", (error: TodoNotFound) => Effect.fail(error))
        ))
      .handle("create", ({ payload }) => todos.create(payload))
      .handle("update", ({ params, payload }) =>
        todos.update(params.id, payload).pipe(
          Effect.catchTag("TodoNotFound", (error: TodoNotFound) => Effect.fail(error))
        ))
  })
).pipe(
  Layer.provide(Todos.layer)
)
