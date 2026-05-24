import {
  type CreateTodoInput,
  makeTodoId,
  TodoNotFound,
  type UpdateTodoInput,
} from "@app/shared"
import { Effect, Layer, Random } from "effect"
import { TodosRepository } from "./repository"
import { Todos } from "./service"

export const TodosLive = Layer.effect(
  Todos,
  Effect.gen(function* () {
    const todosRepository = yield* TodosRepository

    const listByUser = Effect.fn("Todos.listByUser")(function* (userId) {
      return yield* todosRepository.listByUser(userId)
    })

    const getByIdForUser = Effect.fn("Todos.getByIdForUser")(
      function* (userId, id) {
        yield* Effect.annotateCurrentSpan({
          "user.id": userId,
          "todo.id": id,
        })

        const todo = yield* todosRepository.getByIdForUser(userId, id)
        if (todo === null) {
          return yield* new TodoNotFound({ id })
        }

        return todo
      },
    )

    const createForUser = Effect.fn("Todos.createForUser")(function* (
      userId,
      input: CreateTodoInput,
    ) {
      const id = makeTodoId(yield* Random.nextUUIDv4)

      return yield* todosRepository.createForUser({
        id,
        userId,
        title: input.title.trim(),
      })
    })

    const updateForUser = Effect.fn("Todos.updateForUser")(function* (
      userId,
      id,
      input: UpdateTodoInput,
    ) {
      yield* getByIdForUser(userId, id)

      yield* todosRepository.updateCompletedForUser({
        userId,
        id,
        completed: input.completed,
      })

      return yield* getByIdForUser(userId, id)
    })

    return Todos.of({
      listByUser,
      getByIdForUser,
      createForUser,
      updateForUser,
    })
  }),
)
