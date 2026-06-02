import type {
  CreateTodoInput,
  Todo,
  TodoId,
  TodoNotFound,
  UpdateTodoInput,
  UserId,
} from "@app/shared"
import { Context, type Effect } from "effect"
import type { RepositoryError } from "../../errors/repository"

export class Todos extends Context.Service<
  Todos,
  {
    readonly listByUser: (
      userId: UserId,
    ) => Effect.Effect<Array<Todo>, RepositoryError>
    readonly getByIdForUser: (
      userId: UserId,
      id: TodoId,
    ) => Effect.Effect<Todo, TodoNotFound | RepositoryError>
    readonly createForUser: (
      userId: UserId,
      input: CreateTodoInput,
    ) => Effect.Effect<Todo, RepositoryError>
    readonly updateForUser: (
      userId: UserId,
      id: TodoId,
      input: UpdateTodoInput,
    ) => Effect.Effect<Todo, TodoNotFound | RepositoryError>
  }
>()("app/Todos") {}
