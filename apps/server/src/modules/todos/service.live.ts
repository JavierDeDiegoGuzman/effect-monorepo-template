import {
  type CreateTodoInput,
  TodoNotFound,
  type UpdateTodoInput,
} from "@app/shared"
import { Effect, Layer } from "effect"
import { Projects } from "../projects"
import { TodosRepository } from "./repository"
import { Todos } from "./service"

export const TodosLive = Layer.effect(
  Todos,
  Effect.gen(function* () {
    const projects = yield* Projects
    const todosRepository = yield* TodosRepository

    const listByUser = Effect.fn("Todos.listByUser")(function* (
      userId: number,
    ) {
      return yield* todosRepository.listByUser(userId)
    })

    const listByProjectForUser = Effect.fn("Todos.listByProjectForUser")(
      function* (userId: number, projectId: number) {
        return yield* todosRepository.listByProjectForUser(userId, projectId)
      },
    )

    const getByIdForUser = Effect.fn("Todos.getByIdForUser")(function* (
      userId: number,
      id: number,
    ) {
      yield* Effect.annotateCurrentSpan({
        "user.id": userId,
        "todo.id": id,
      })

      const todo = yield* todosRepository.getByIdForUser(userId, id)
      if (todo === null) {
        return yield* new TodoNotFound({ id })
      }

      return todo
    })

    const createForUser = Effect.fn("Todos.createForUser")(function* (
      userId: number,
      input: CreateTodoInput,
    ) {
      if (input.projectId !== null) {
        yield* projects.getByIdForUser(userId, input.projectId)
      }

      return yield* todosRepository.createForUser({
        userId,
        title: input.title.trim(),
        projectId: input.projectId,
      })
    })

    const updateForUser = Effect.fn("Todos.updateForUser")(function* (
      userId: number,
      id: number,
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
      listByProjectForUser,
      getByIdForUser,
      createForUser,
      updateForUser,
    })
  }),
)
