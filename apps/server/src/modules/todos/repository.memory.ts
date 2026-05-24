import { Todo } from "@app/shared"
import { Effect, Layer, Ref } from "effect"
import { TodosRepository } from "./repository"

export const makeInMemoryTodosRepositoryLayer = (
  initialTodos: ReadonlyArray<Todo> = [],
) =>
  Layer.effect(
    TodosRepository,
    Effect.gen(function* () {
      const store = yield* Ref.make(
        new Map(initialTodos.map((todo) => [todo.id, todo])),
      )

      const listByUser = Effect.fn("InMemoryTodosRepository.listByUser")(
        function* (userId) {
          return Array.from((yield* Ref.get(store)).values()).filter(
            (todo) => todo.userId === userId,
          )
        },
      )

      const getByIdForUser = Effect.fn(
        "InMemoryTodosRepository.getByIdForUser",
      )(function* (userId, id) {
        const todo = (yield* Ref.get(store)).get(id)
        return todo !== undefined && todo.userId === userId ? todo : null
      })

      const createForUser = Effect.fn("InMemoryTodosRepository.createForUser")(
        function* (input) {
          const todo = new Todo({
            id: input.id,
            userId: input.userId,
            title: input.title,
            completed: false,
          })
          yield* Ref.update(store, (current) =>
            new Map(current).set(input.id, todo),
          )
          return todo
        },
      )

      const updateCompletedForUser = Effect.fn(
        "InMemoryTodosRepository.updateCompletedForUser",
      )(function* (input) {
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
