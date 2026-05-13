import type { Project, Todo, User } from "@app/shared"
import { Layer } from "effect"
import { makeJsonProjectsRepositoryLayer } from "../../repositories/projects/JsonProjectsRepository"
import { makeJsonTodosRepositoryLayer } from "../../repositories/todos/JsonTodosRepository"
import { JsonTransactionsLayer } from "../../repositories/transactions/JsonTransactions"
import { makeJsonUsersRepositoryLayer } from "../../repositories/users/JsonUsersRepository"

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
    makeJsonUsersRepositoryLayer(seed.users),
    makeJsonProjectsRepositoryLayer(seed.projects),
    makeJsonTodosRepositoryLayer(seed.todos),
    JsonTransactionsLayer,
  )

export const InMemoryRepositoriesLayer = makeInMemoryRepositoriesLayer()
