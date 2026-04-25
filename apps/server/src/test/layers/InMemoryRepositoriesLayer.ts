import type {
  Project,
  Todo,
  User,
  Workspace,
  WorkspaceMember,
} from "@app/shared"
import { Layer } from "effect"
import { makeInMemoryProjectsRepositoryLayer } from "../../repositories/memory/InMemoryProjectsRepository"
import { makeInMemoryTodosRepositoryLayer } from "../../repositories/memory/InMemoryTodosRepository"
import { InMemoryTransactionsLayer } from "../../repositories/memory/InMemoryTransactions"
import { makeInMemoryUsersRepositoryLayer } from "../../repositories/memory/InMemoryUsersRepository"
import { makeInMemoryWorkspacesRepositoryLayer } from "../../repositories/memory/InMemoryWorkspacesRepository"

type InMemoryRepositorySeed = {
  readonly users?: ReadonlyArray<{
    readonly user: User
    readonly passwordHash: string
  }>
  readonly workspaces?: ReadonlyArray<Workspace>
  readonly memberships?: ReadonlyArray<WorkspaceMember>
  readonly projects?: ReadonlyArray<Project>
  readonly todos?: ReadonlyArray<Todo>
}

export const makeInMemoryRepositoriesLayer = (
  seed: InMemoryRepositorySeed = {},
) =>
  Layer.mergeAll(
    makeInMemoryUsersRepositoryLayer(seed.users),
    makeInMemoryWorkspacesRepositoryLayer({
      workspaces: seed.workspaces,
      memberships: seed.memberships,
    }),
    makeInMemoryProjectsRepositoryLayer(seed.projects),
    makeInMemoryTodosRepositoryLayer(seed.todos),
    InMemoryTransactionsLayer,
  )

export const InMemoryRepositoriesLayer = makeInMemoryRepositoriesLayer()
