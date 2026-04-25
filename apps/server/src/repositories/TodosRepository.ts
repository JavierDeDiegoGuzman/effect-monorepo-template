import type { Todo } from "@app/shared"
import { type Effect, ServiceMap } from "effect"

export class TodosRepository extends ServiceMap.Service<
  TodosRepository,
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
    ) => Effect.Effect<Todo | null>
    readonly createInWorkspace: (input: {
      readonly workspaceId: number
      readonly title: string
      readonly projectId: number | null
    }) => Effect.Effect<Todo>
    readonly updateCompletedInWorkspace: (input: {
      readonly workspaceId: number
      readonly id: number
      readonly completed: boolean
    }) => Effect.Effect<void>
  }
>()("app/repositories/TodosRepository") {}
