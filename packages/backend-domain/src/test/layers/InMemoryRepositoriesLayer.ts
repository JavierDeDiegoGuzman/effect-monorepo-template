import type { Todo, User } from "@app/shared"
import { Layer } from "effect"
import { makeInMemoryAuthCredentialsRepositoryLayer } from "../../modules/auth/credentials.repository.memory"
import { makeInMemoryTodosRepositoryLayer } from "../../modules/todos/repository.memory"
import { makeInMemoryUsersRepositoryLayer } from "../../modules/users/repository.memory"
import { InMemoryTransactionsLayer } from "../../transactions.memory"

export type InMemoryRepositorySeed = {
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
    makeInMemoryUsersRepositoryLayer(seed.users?.map((record) => record.user)),
    makeInMemoryTodosRepositoryLayer(seed.todos),
    makeInMemoryAuthCredentialsRepositoryLayer(
      seed.users?.map((record) => ({
        userId: record.user.id,
        passwordHash: record.passwordHash,
      })),
    ),
    InMemoryTransactionsLayer,
  )

export const InMemoryRepositoriesLayer = makeInMemoryRepositoriesLayer()
