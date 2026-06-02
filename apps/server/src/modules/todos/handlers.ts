import { Todos } from "@app/backend-domain"
import { Api, CurrentUser } from "@app/shared"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { withHttpErrorMapping } from "../../http/errors"

export const TodosApiHandlers = HttpApiBuilder.group(
  Api,
  "todos",
  Effect.fn(function* (handlers) {
    const todos = yield* Todos

    return handlers
      .handle("list", () =>
        withHttpErrorMapping(
          Effect.gen(function* () {
            const user = yield* CurrentUser
            return yield* todos.listByUser(user.id)
          }),
        ).pipe(
          Effect.annotateSpans({
            "http.route": "/todos",
            "http.method": "GET",
          }),
        ),
      )
      .handle("getById", ({ params }) =>
        withHttpErrorMapping(
          Effect.gen(function* () {
            const user = yield* CurrentUser
            return yield* todos.getByIdForUser(user.id, params.id)
          }),
        ).pipe(
          Effect.annotateSpans({
            "http.route": "/todos/:id",
            "http.method": "GET",
            "todo.id": params.id,
          }),
        ),
      )
      .handle("create", ({ payload }) =>
        withHttpErrorMapping(
          Effect.gen(function* () {
            const user = yield* CurrentUser
            return yield* todos.createForUser(user.id, payload)
          }),
        ).pipe(
          Effect.annotateSpans({
            "http.route": "/todos",
            "http.method": "POST",
            "todo.title.length": payload.title.length,
          }),
        ),
      )
      .handle("update", ({ params, payload }) =>
        withHttpErrorMapping(
          Effect.gen(function* () {
            const user = yield* CurrentUser
            return yield* todos.updateForUser(user.id, params.id, payload)
          }),
        ).pipe(
          Effect.annotateSpans({
            "http.route": "/todos/:id",
            "http.method": "PATCH",
            "todo.id": params.id,
            "todo.completed": payload.completed,
          }),
        ),
      )
  }),
)
