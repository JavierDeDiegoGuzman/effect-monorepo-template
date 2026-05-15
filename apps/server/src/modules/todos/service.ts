import type {
  CreateTodoInput,
  Todo,
  TodoNotFound,
  UpdateTodoInput,
} from "@app/shared"
import { type Effect, ServiceMap } from "effect"

export class Todos extends ServiceMap.Service<
  Todos,
  {
    readonly listByUser: (userId: number) => Effect.Effect<Array<Todo>>
    readonly getByIdForUser: (
      userId: number,
      id: number,
    ) => Effect.Effect<Todo, TodoNotFound>
    readonly createForUser: (
      userId: number,
      input: CreateTodoInput,
    ) => Effect.Effect<Todo>
    readonly updateForUser: (
      userId: number,
      id: number,
      input: UpdateTodoInput,
    ) => Effect.Effect<Todo, TodoNotFound>
  }
>()("app/Todos") {}
