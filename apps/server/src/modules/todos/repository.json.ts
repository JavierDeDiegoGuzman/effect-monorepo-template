import { Todo } from "@app/shared"
import { Effect, Layer } from "effect"
import { JsonDatabase, type JsonTodoRecord } from "../../database/json"
import { TodosRepository } from "./repository"

const toTodo = (record: JsonTodoRecord) =>
  new Todo({
    id: record.id,
    userId: record.userId,
    title: record.title,
    completed: record.completed,
  })

export const JsonTodosRepositoryLayer = Layer.effect(
  TodosRepository,
  Effect.gen(function* () {
    const database = yield* JsonDatabase

    const listByUser = Effect.fn("JsonTodosRepository.listByUser")(function* (
      userId: number,
    ) {
      const state = yield* database.read
      return state.todos
        .filter((todo) => todo.userId === userId)
        .sort((a, b) => a.id - b.id)
        .map(toTodo)
    })

    const getByIdForUser = Effect.fn("JsonTodosRepository.getByIdForUser")(
      function* (userId: number, id: number) {
        const state = yield* database.read
        const record = state.todos.find(
          (todo) => todo.id === id && todo.userId === userId,
        )
        return record === undefined ? null : toTodo(record)
      },
    )

    const createForUser = Effect.fn("JsonTodosRepository.createForUser")(
      function* (input: { readonly userId: number; readonly title: string }) {
        return yield* database.update((state) => {
          const id =
            state.todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1
          const record: JsonTodoRecord = {
            id,
            userId: input.userId,
            title: input.title,
            completed: false,
          }

          return [
            {
              ...state,
              todos: [...state.todos, record],
            },
            toTodo(record),
          ]
        })
      },
    )

    const updateCompletedForUser = Effect.fn(
      "JsonTodosRepository.updateCompletedForUser",
    )(function* (input: {
      readonly userId: number
      readonly id: number
      readonly completed: boolean
    }) {
      yield* database.update((state) => [
        {
          ...state,
          todos: state.todos.map((todo) =>
            todo.id === input.id && todo.userId === input.userId
              ? { ...todo, completed: input.completed }
              : todo,
          ),
        },
        undefined,
      ])
    })

    return TodosRepository.of({
      listByUser,
      getByIdForUser,
      createForUser,
      updateCompletedForUser,
    })
  }),
)
