import type { CreateTodoInput, TodoId, UpdateTodoInput } from "@app/shared"
import { Effect } from "effect"
import * as Atom from "effect/unstable/reactivity/Atom"
import { ApiClient } from "@/api/client"
import { apiRuntime } from "@/lib/runtime"
import { currentSessionQuery } from "../auth"

export const todosQuery = apiRuntime
  .atom((get) =>
    get.result(currentSessionQuery, { suspendOnWaiting: true }).pipe(
      Effect.flatMap((session) => {
        if (session === null) {
          return Effect.succeed([])
        }

        return ApiClient.use((client) => client.todos.list())
      }),
      Effect.withSpan("todos.list", {
        kind: "client",
      }),
    ),
  )
  .pipe(Atom.keepAlive, Atom.withReactivity(["todos", "auth"]))

export const createTodoAction = apiRuntime.fn(
  (input: CreateTodoInput) =>
    ApiClient.use((client) => client.todos.create({ payload: input })).pipe(
      Effect.annotateSpans({
        "todo.title.length": input.title.length,
      }),
      Effect.withSpan("todos.create", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["todos"] },
)

export const updateTodoAction = apiRuntime.fn(
  ({ id, input }: { readonly id: TodoId; readonly input: UpdateTodoInput }) =>
    ApiClient.use((client) =>
      client.todos.update({ params: { id }, payload: input }),
    ).pipe(
      Effect.annotateSpans({
        "todo.id": id,
        "todo.completed": input.completed,
      }),
      Effect.withSpan("todos.update", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["todos"] },
)
