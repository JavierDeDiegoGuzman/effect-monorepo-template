import type { Todo, TodoId, UserId } from "@app/shared"
import { Context, type Effect } from "effect"
import type { RepositoryError } from "../../errors/repository"

export class TodosRepository extends Context.Service<
  TodosRepository,
  {
    readonly listByUser: (
      userId: UserId,
    ) => Effect.Effect<Array<Todo>, RepositoryError>
    readonly getByIdForUser: (
      userId: UserId,
      id: TodoId,
    ) => Effect.Effect<Todo | null, RepositoryError>
    readonly createForUser: (input: {
      readonly id: TodoId
      readonly userId: UserId
      readonly title: string
    }) => Effect.Effect<Todo, RepositoryError>
    readonly updateCompletedForUser: (input: {
      readonly userId: UserId
      readonly id: TodoId
      readonly completed: boolean
    }) => Effect.Effect<void, RepositoryError>
  }
>()("app/modules/todos/TodosRepository") {}
