import { Todo } from "@app/shared"
import { Effect, Layer, Ref } from "effect"
import { TodosRepository } from "./repository"

export const makeInMemoryTodosRepositoryLayer = (
  initialTodos: ReadonlyArray<Todo> = [],
) =>
  Layer.effect(
    TodosRepository,
    Effect.gen(function* () {
      const nextId = yield* Ref.make(
        initialTodos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1,
      )
      const store = yield* Ref.make(
        new Map(initialTodos.map((todo) => [todo.id, todo])),
      )

      const listByUser = Effect.fn("InMemoryTodosRepository.listByUser")(
        function* (userId: number) {
          return Array.from((yield* Ref.get(store)).values()).filter(
            (todo) => todo.userId === userId,
          )
        },
      )

      const getByIdForUser = Effect.fn(
        "InMemoryTodosRepository.getByIdForUser",
      )(function* (userId: number, id: number) {
        const todo = (yield* Ref.get(store)).get(id)
        return todo !== undefined && todo.userId === userId ? todo : null
      })

      const createForUser = Effect.fn("InMemoryTodosRepository.createForUser")(
        function* (input: { readonly userId: number; readonly title: string }) {
          const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
          const todo = new Todo({
            id,
            userId: input.userId,
            title: input.title,
            completed: false,
          })
          yield* Ref.update(store, (current) => new Map(current).set(id, todo))
          return todo
        },
      )

      const updateCompletedForUser = Effect.fn(
        "InMemoryTodosRepository.updateCompletedForUser",
      )(function* (input: {
        readonly userId: number
        readonly id: number
        readonly completed: boolean
      }) {
        yield* Ref.update(store, (current) => {
          const todo = current.get(input.id)
          if (todo === undefined || todo.userId !== input.userId) {
            return current
          }
          return new Map(current).set(
            input.id,
            new Todo({ ...todo, completed: input.completed }),
          )
        })
      })

      return TodosRepository.of({
        listByUser,
        getByIdForUser,
        createForUser,
        updateCompletedForUser,
      })
    }),
  )

export const InMemoryTodosRepositoryLayer = makeInMemoryTodosRepositoryLayer()
