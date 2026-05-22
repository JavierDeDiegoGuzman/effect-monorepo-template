import type { Todo } from "@app/shared"
import { Context, type Effect } from "effect"
import type { RepositoryError } from "../../errors/repository"

export class TodosRepository extends Context.Service<
  TodosRepository,
  {
    readonly listByUser: (
      userId: number,
    ) => Effect.Effect<Array<Todo>, RepositoryError>
    readonly getByIdForUser: (
      userId: number,
      id: number,
    ) => Effect.Effect<Todo | null, RepositoryError>
    readonly createForUser: (input: {
      readonly userId: number
      readonly title: string
    }) => Effect.Effect<Todo, RepositoryError>
    readonly updateCompletedForUser: (input: {
      readonly userId: number
      readonly id: number
      readonly completed: boolean
    }) => Effect.Effect<void, RepositoryError>
  }
>()("app/modules/todos/TodosRepository") {}
