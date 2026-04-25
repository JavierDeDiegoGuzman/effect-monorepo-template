import { Todo } from "@app/shared"
import { Effect, Layer, Ref } from "effect"
import { TodosRepository } from "../TodosRepository"

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

      const listByWorkspace = Effect.fn(
        "InMemoryTodosRepository.listByWorkspace",
      )(function* (workspaceId: number) {
        return Array.from((yield* Ref.get(store)).values()).filter(
          (todo) => todo.workspaceId === workspaceId,
        )
      })

      const listByProjectInWorkspace = Effect.fn(
        "InMemoryTodosRepository.listByProjectInWorkspace",
      )(function* (workspaceId: number, projectId: number) {
        return Array.from((yield* Ref.get(store)).values()).filter(
          (todo) =>
            todo.workspaceId === workspaceId && todo.projectId === projectId,
        )
      })

      const getByIdInWorkspace = Effect.fn(
        "InMemoryTodosRepository.getByIdInWorkspace",
      )(function* (workspaceId: number, id: number) {
        const todo = (yield* Ref.get(store)).get(id)
        return todo !== undefined && todo.workspaceId === workspaceId
          ? todo
          : null
      })

      const createInWorkspace = Effect.fn(
        "InMemoryTodosRepository.createInWorkspace",
      )(function* (input: {
        readonly workspaceId: number
        readonly title: string
        readonly projectId: number | null
      }) {
        const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
        const todo = new Todo({
          id,
          workspaceId: input.workspaceId,
          title: input.title,
          completed: false,
          projectId: input.projectId,
        })
        yield* Ref.update(store, (current) => new Map(current).set(id, todo))
        return todo
      })

      const updateCompletedInWorkspace = Effect.fn(
        "InMemoryTodosRepository.updateCompletedInWorkspace",
      )(function* (input: {
        readonly workspaceId: number
        readonly id: number
        readonly completed: boolean
      }) {
        yield* Ref.update(store, (current) => {
          const todo = current.get(input.id)
          if (todo === undefined || todo.workspaceId !== input.workspaceId) {
            return current
          }
          return new Map(current).set(
            input.id,
            new Todo({ ...todo, completed: input.completed }),
          )
        })
      })

      return TodosRepository.of({
        listByWorkspace,
        listByProjectInWorkspace,
        getByIdInWorkspace,
        createInWorkspace,
        updateCompletedInWorkspace,
      })
    }),
  )

export const InMemoryTodosRepositoryLayer = makeInMemoryTodosRepositoryLayer()
