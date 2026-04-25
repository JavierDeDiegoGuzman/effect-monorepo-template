import {
  type CreateTodoInput,
  type ProjectNotFound,
  type Todo,
  TodoNotFound,
  type UpdateTodoInput,
} from "@app/shared"
import { Effect, Layer, ServiceMap } from "effect"
import { TodosRepository } from "../repositories/TodosRepository"
import { Projects } from "./Projects"

export class Todos extends ServiceMap.Service<
  Todos,
  {
    readonly listByWorkspace: (
      workspaceId: number,
    ) => Effect.Effect<Array<Todo>>
    readonly listByProjectInWorkspace: (
      workspaceId: number,
      projectId: number,
    ) => Effect.Effect<Array<Todo>>
    readonly getByIdInWorkspace: (
      workspaceId: number,
      id: number,
    ) => Effect.Effect<Todo, TodoNotFound>
    readonly createInWorkspace: (
      workspaceId: number,
      input: CreateTodoInput,
    ) => Effect.Effect<Todo, ProjectNotFound>
    readonly updateInWorkspace: (
      workspaceId: number,
      id: number,
      input: UpdateTodoInput,
    ) => Effect.Effect<Todo, TodoNotFound>
  }
>()("app/Todos") {
  static readonly layer = Layer.effect(
    Todos,
    Effect.gen(function* () {
      const projects = yield* Projects
      const todosRepository = yield* TodosRepository

      const listByWorkspace = Effect.fn("Todos.listByWorkspace")(function* (
        workspaceId: number,
      ) {
        return yield* todosRepository.listByWorkspace(workspaceId)
      })

      const listByProjectInWorkspace = Effect.fn(
        "Todos.listByProjectInWorkspace",
      )(function* (workspaceId: number, projectId: number) {
        return yield* todosRepository.listByProjectInWorkspace(
          workspaceId,
          projectId,
        )
      })

      const getByIdInWorkspace = Effect.fn("Todos.getByIdInWorkspace")(
        function* (workspaceId: number, id: number) {
          yield* Effect.annotateCurrentSpan({
            "workspace.id": workspaceId,
            "todo.id": id,
          })

          const todo = yield* todosRepository.getByIdInWorkspace(
            workspaceId,
            id,
          )
          if (todo === null) {
            return yield* new TodoNotFound({ id })
          }

          return todo
        },
      )

      const createInWorkspace = Effect.fn("Todos.createInWorkspace")(function* (
        workspaceId: number,
        input: CreateTodoInput,
      ) {
        if (input.projectId !== null) {
          yield* projects.getByIdInWorkspace(workspaceId, input.projectId)
        }

        return yield* todosRepository.createInWorkspace({
          workspaceId,
          title: input.title.trim(),
          projectId: input.projectId,
        })
      })

      const updateInWorkspace = Effect.fn("Todos.updateInWorkspace")(function* (
        workspaceId: number,
        id: number,
        input: UpdateTodoInput,
      ) {
        yield* getByIdInWorkspace(workspaceId, id)

        yield* todosRepository.updateCompletedInWorkspace({
          workspaceId,
          id,
          completed: input.completed,
        })

        return yield* getByIdInWorkspace(workspaceId, id)
      })

      return Todos.of({
        listByWorkspace,
        listByProjectInWorkspace,
        getByIdInWorkspace,
        createInWorkspace,
        updateInWorkspace,
      })
    }),
  )
}
