import {
  type CreateTodoInput,
  ProjectNotFound,
  Todo,
  TodoNotFound,
  type UpdateTodoInput,
} from "@app/shared"
import { Effect, Layer, Ref, ServiceMap } from "effect"
import { Projects } from "./Projects"

export class Todos extends ServiceMap.Service<
  Todos,
  {
    readonly listByWorkspace: (workspaceId: number) => Effect.Effect<Array<Todo>>
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
      const nextId = yield* Ref.make(3)
      const store = new Map<number, Todo>([
        [
          1,
          new Todo({
            id: 1,
            workspaceId: 1,
            title: "Learn Effect HttpApi",
            completed: true,
            projectId: 1,
          }),
        ],
        [
          2,
          new Todo({
            id: 2,
            workspaceId: 2,
            title: "Build the webapp",
            completed: false,
            projectId: 2,
          }),
        ],
      ])

      const listByWorkspace = Effect.fn("Todos.listByWorkspace")(function* (
        workspaceId: number,
      ) {
        return Array.from(store.values()).filter((todo) => todo.workspaceId === workspaceId)
      })

      const listByProjectInWorkspace = Effect.fn("Todos.listByProjectInWorkspace")(function* (
        workspaceId: number,
        projectId: number,
      ) {
        return Array.from(store.values()).filter(
          (todo) => todo.workspaceId === workspaceId && todo.projectId === projectId,
        )
      })

      const getByIdInWorkspace = Effect.fn("Todos.getByIdInWorkspace")(function* (
        workspaceId: number,
        id: number,
      ) {
        yield* Effect.annotateCurrentSpan({
          "workspace.id": workspaceId,
          "todo.id": id,
        })

        const todo = store.get(id)
        if (todo === undefined || todo.workspaceId !== workspaceId) {
          return yield* new TodoNotFound({ id })
        }
        return todo
      })

      const createInWorkspace = Effect.fn("Todos.createInWorkspace")(function* (
        workspaceId: number,
        input: CreateTodoInput,
      ) {
        if (input.projectId !== null) {
          yield* projects.getByIdInWorkspace(workspaceId, input.projectId)
        }

        const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
        const todo = new Todo({
          id,
          workspaceId,
          title: input.title.trim(),
          completed: false,
          projectId: input.projectId,
        })
        store.set(id, todo)
        return todo
      })

      const updateInWorkspace = Effect.fn("Todos.updateInWorkspace")(function* (
        workspaceId: number,
        id: number,
        input: UpdateTodoInput,
      ) {
        const todo = yield* getByIdInWorkspace(workspaceId, id)
        const updated = new Todo({
          ...todo,
          completed: input.completed,
        })
        store.set(id, updated)
        return updated
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
