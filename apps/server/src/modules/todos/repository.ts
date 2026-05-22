import type { Todo } from "@app/shared"
import { Context, type Effect } from "effect"

export class TodosRepository extends Context.Service<
  TodosRepository,
  {
    readonly listByUser: (userId: number) => Effect.Effect<Array<Todo>>
    readonly getByIdForUser: (
      userId: number,
      id: number,
    ) => Effect.Effect<Todo | null>
    readonly createForUser: (input: {
      readonly userId: number
      readonly title: string
    }) => Effect.Effect<Todo>
    readonly updateCompletedForUser: (input: {
      readonly userId: number
      readonly id: number
      readonly completed: boolean
    }) => Effect.Effect<void>
  }
>()("app/modules/todos/TodosRepository") {}
