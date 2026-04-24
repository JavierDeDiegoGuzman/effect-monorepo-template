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
    readonly list: Effect.Effect<Array<Todo>>
    readonly listByProject: (projectId: number) => Effect.Effect<Array<Todo>>
    readonly getById: (id: number) => Effect.Effect<Todo, TodoNotFound>
    readonly create: (input: CreateTodoInput) => Effect.Effect<Todo, ProjectNotFound>
    readonly update: (
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
            title: "Learn Effect HttpApi",
            completed: true,
            projectId: 1,
          }),
        ],
        [
          2,
          new Todo({
            id: 2,
            title: "Build the webapp",
            completed: false,
            projectId: 2,
          }),
        ],
      ])

      const list = Effect.fn("Todos.list")(function* () {
        return Array.from(store.values())
      })()

      const listByProject = Effect.fn("Todos.listByProject")(function* (
        projectId: number,
      ) {
        yield* Effect.annotateCurrentSpan({
          "project.id": projectId,
        })

        return Array.from(store.values()).filter((todo) => todo.projectId === projectId)
      })

      const getById = Effect.fn("Todos.getById")(function* (id: number) {
        yield* Effect.annotateCurrentSpan({
          "todo.id": id,
        })

        const todo = store.get(id)
        if (todo === undefined) {
          return yield* new TodoNotFound({ id })
        }
        return todo
      })

      const create = Effect.fn("Todos.create")(function* (
        input: CreateTodoInput,
      ) {
        if (input.projectId !== null) {
          yield* projects.getById(input.projectId)
        }

        yield* Effect.annotateCurrentSpan({
          "todo.title.length": input.title.length,
          "todo.project.id": input.projectId ?? "none",
        })

        const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
        const todo = new Todo({
          id,
          title: input.title,
          completed: false,
          projectId: input.projectId,
        })
        store.set(id, todo)

        yield* Effect.annotateCurrentSpan({
          "todo.id": todo.id,
          "todo.completed": todo.completed,
        })

        return todo
      })

      const update = Effect.fn("Todos.update")(function* (
        id: number,
        input: UpdateTodoInput,
      ) {
        yield* Effect.annotateCurrentSpan({
          "todo.id": id,
          "todo.completed": input.completed,
        })

        const todo = yield* getById(id)
        const updated = new Todo({ ...todo, completed: input.completed })
        store.set(id, updated)
        return updated
      })

      return Todos.of({ list, listByProject, getById, create, update })
    }),
  )
}
