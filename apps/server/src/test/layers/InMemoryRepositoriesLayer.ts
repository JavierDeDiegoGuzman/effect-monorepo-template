import type { Todo, User } from "@app/shared"
import { Layer } from "effect"
import { InMemoryTransactionsLayer } from "../../database/transactions.memory"
import { makeInMemoryTodosRepositoryLayer } from "../../modules/todos"
import { makeInMemoryUsersRepositoryLayer } from "../../modules/users"

type InMemoryRepositorySeed = {
  readonly users?: ReadonlyArray<{
    readonly user: User
    readonly passwordHash: string
  }>
  readonly todos?: ReadonlyArray<Todo>
}

export const makeInMemoryRepositoriesLayer = (
  seed: InMemoryRepositorySeed = {},
) =>
  Layer.mergeAll(
    makeInMemoryUsersRepositoryLayer(seed.users),
    makeInMemoryTodosRepositoryLayer(seed.todos),
    InMemoryTransactionsLayer,
  )

export const InMemoryRepositoriesLayer = makeInMemoryRepositoriesLayer()
