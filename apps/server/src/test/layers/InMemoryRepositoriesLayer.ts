import type { Project, Todo, User } from "@app/shared"
import { Layer } from "effect"
import { makeInMemoryProjectsRepositoryLayer } from "../../repositories/memory/InMemoryProjectsRepository"
import { makeInMemoryTodosRepositoryLayer } from "../../repositories/memory/InMemoryTodosRepository"
import { InMemoryTransactionsLayer } from "../../repositories/memory/InMemoryTransactions"
import { makeInMemoryUsersRepositoryLayer } from "../../repositories/memory/InMemoryUsersRepository"

type InMemoryRepositorySeed = {
  readonly users?: ReadonlyArray<{
    readonly user: User
    readonly passwordHash: string
  }>
  readonly projects?: ReadonlyArray<Project>
  readonly todos?: ReadonlyArray<Todo>
}

export const makeInMemoryRepositoriesLayer = (
  seed: InMemoryRepositorySeed = {},
) =>
  Layer.mergeAll(
    makeInMemoryUsersRepositoryLayer(seed.users),
    makeInMemoryProjectsRepositoryLayer(seed.projects),
    makeInMemoryTodosRepositoryLayer(seed.todos),
    InMemoryTransactionsLayer,
  )

export const InMemoryRepositoriesLayer = makeInMemoryRepositoriesLayer()
