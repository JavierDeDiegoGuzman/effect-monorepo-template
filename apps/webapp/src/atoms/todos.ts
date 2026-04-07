import { CreateTodoInput, UpdateTodoInput } from "@app/shared"
import * as Atom from "effect/unstable/reactivity/Atom"
import { ApiClient } from "../api/client"

const apiRuntime = Atom.runtime(ApiClient.layer)

export const todosAtom = apiRuntime.atom(
  ApiClient.use((client) => client.todos.list())
).pipe(
  Atom.keepAlive,
  Atom.withReactivity(["todos"])
)

export const createTodoAtom = apiRuntime.fn(
  (input: CreateTodoInput) =>
    ApiClient.use((client) => client.todos.create({ payload: input })),
  { reactivityKeys: ["todos"] }
)

export const updateTodoAtom = apiRuntime.fn(
  ({ id, input }: { readonly id: number; readonly input: UpdateTodoInput }) =>
    ApiClient.use((client) => client.todos.update({ params: { id }, payload: input })),
  { reactivityKeys: ["todos"] }
)
