import {
  type CreateTodoInput,
  type ProjectNotFound,
  type Todo,
  TodoNotFound,
  type UpdateTodoInput,
} from "@app/shared"
import { Effect, ServiceMap } from "effect"

export class Todos extends ServiceMap.Service<
  Todos,
  {
    readonly listByUser: (userId: number) => Effect.Effect<Array<Todo>>
    readonly listByProjectForUser: (
      userId: number,
      projectId: number,
    ) => Effect.Effect<Array<Todo>>
    readonly getByIdForUser: (
      userId: number,
      id: number,
    ) => Effect.Effect<Todo, TodoNotFound>
    readonly createForUser: (
      userId: number,
      input: CreateTodoInput,
    ) => Effect.Effect<Todo, ProjectNotFound>
    readonly updateForUser: (
      userId: number,
      id: number,
      input: UpdateTodoInput,
    ) => Effect.Effect<Todo, TodoNotFound>
  }
>()("app/Todos") {}
