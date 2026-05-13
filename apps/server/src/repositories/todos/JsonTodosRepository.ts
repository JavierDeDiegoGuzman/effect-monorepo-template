import { Todo } from "@app/shared"
import { Effect, Layer, Ref } from "effect"
import { TodosRepository } from "./TodosRepository"

export const makeJsonTodosRepositoryLayer = (
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

      const listByUser = Effect.fn("JsonTodosRepository.listByUser")(
        function* (userId: number) {
          return Array.from((yield* Ref.get(store)).values()).filter(
            (todo) => todo.userId === userId,
          )
        },
      )

      const listByProjectForUser = Effect.fn(
        "JsonTodosRepository.listByProjectForUser",
      )(function* (userId: number, projectId: number) {
        return Array.from((yield* Ref.get(store)).values()).filter(
          (todo) => todo.userId === userId && todo.projectId === projectId,
        )
      })

      const getByIdForUser = Effect.fn(
        "JsonTodosRepository.getByIdForUser",
      )(function* (userId: number, id: number) {
        const todo = (yield* Ref.get(store)).get(id)
        return todo !== undefined && todo.userId === userId ? todo : null
      })

      const createForUser = Effect.fn("JsonTodosRepository.createForUser")(
        function* (input: {
          readonly userId: number
          readonly title: string
          readonly projectId: number | null
        }) {
          const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
          const todo = new Todo({
            id,
            userId: input.userId,
            title: input.title,
            completed: false,
            projectId: input.projectId,
          })
          yield* Ref.update(store, (current) => new Map(current).set(id, todo))
          return todo
        },
      )

      const updateCompletedForUser = Effect.fn(
        "JsonTodosRepository.updateCompletedForUser",
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
        listByProjectForUser,
        getByIdForUser,
        createForUser,
        updateCompletedForUser,
      })
    }),
  )

export const JsonTodosRepositoryLayer = makeJsonTodosRepositoryLayer()
