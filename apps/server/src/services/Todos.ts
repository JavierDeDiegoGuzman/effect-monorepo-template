import { CreateTodoInput, Todo, TodoNotFound, UpdateTodoInput } from "@app/shared"
import { Effect, Layer, Ref, ServiceMap } from "effect"

export class Todos extends ServiceMap.Service<Todos, {
  readonly list: Effect.Effect<Array<Todo>>
  readonly getById: (id: number) => Effect.Effect<Todo, TodoNotFound>
  readonly create: (input: CreateTodoInput) => Effect.Effect<Todo>
  readonly update: (id: number, input: UpdateTodoInput) => Effect.Effect<Todo, TodoNotFound>
}>()("app/Todos") {
  static readonly layer = Layer.effect(
    Todos,
    Effect.gen(function*() {
      const nextId = yield* Ref.make(3)
      const store = new Map<number, Todo>([
        [1, new Todo({ id: 1, title: "Learn Effect HttpApi", completed: true })],
        [2, new Todo({ id: 2, title: "Build the webapp", completed: false })]
      ])

      const list = Effect.sync(() => Array.from(store.values()))

      const getById = Effect.fn(function*(id: number) {
        const todo = store.get(id)
        if (todo === undefined) {
          return yield* new TodoNotFound({ id })
        }
        return todo
      })

      const create = Effect.fn(function*(input: CreateTodoInput) {
        const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
        const todo = new Todo({ id, title: input.title, completed: false })
        store.set(id, todo)
        return todo
      })

      const update = Effect.fn(function*(id: number, input: UpdateTodoInput) {
        const todo = yield* getById(id)
        const updated = new Todo({ ...todo, completed: input.completed })
        store.set(id, updated)
        return updated
      })

      return Todos.of({ list, getById, create, update })
    })
  )
}
