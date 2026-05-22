import type {
  CreateTodoInput,
  Todo,
  TodoNotFound,
  UpdateTodoInput,
} from "@app/shared"
import { Context, type Effect } from "effect"
import type { RepositoryError } from "../../errors/repository"

export class Todos extends Context.Service<
  Todos,
  {
    readonly listByUser: (
      userId: number,
    ) => Effect.Effect<Array<Todo>, RepositoryError>
    readonly getByIdForUser: (
      userId: number,
      id: number,
    ) => Effect.Effect<Todo, TodoNotFound | RepositoryError>
    readonly createForUser: (
      userId: number,
      input: CreateTodoInput,
    ) => Effect.Effect<Todo, RepositoryError>
    readonly updateForUser: (
      userId: number,
      id: number,
      input: UpdateTodoInput,
    ) => Effect.Effect<Todo, TodoNotFound | RepositoryError>
  }
>()("app/Todos") {}
