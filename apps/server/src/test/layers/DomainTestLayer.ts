import { Layer } from "effect"
import type { ProjectsRepository } from "../../repositories/ProjectsRepository"
import type { TodosRepository } from "../../repositories/TodosRepository"
import type { Transactions } from "../../repositories/Transactions"
import type { UsersRepository } from "../../repositories/UsersRepository"
import type { WorkspacesRepository } from "../../repositories/WorkspacesRepository"
import { Projects } from "../../services/Projects"
import { Todos } from "../../services/Todos"
import { Users } from "../../services/Users"
import { Workspaces } from "../../services/Workspaces"
import {
  InMemoryRepositoriesLayer,
  makeInMemoryRepositoriesLayer,
} from "./InMemoryRepositoriesLayer"
import {
  makeSqlRepositoriesTestLayer,
  SqlRepositoriesTestLayer,
} from "./SqlRepositoriesTestLayer"

type Repositories =
  | UsersRepository
  | WorkspacesRepository
  | ProjectsRepository
  | TodosRepository
  | Transactions

type RepositoriesLayer = Layer.Layer<Repositories, any, never>

const makeDomainLayer = (repositoriesLayer: RepositoriesLayer) => {
  const coreDomainLayer = Layer.mergeAll(
    Users.layer,
    Workspaces.layer,
    Projects.layer,
  ).pipe(Layer.provide(repositoriesLayer))

  const todosDomainLayer = Todos.layer.pipe(
    Layer.provideMerge(coreDomainLayer),
    Layer.provide(repositoriesLayer),
  )

  return Layer.mergeAll(coreDomainLayer, todosDomainLayer)
}

export const InMemoryDomainTestLayer = makeDomainLayer(
  InMemoryRepositoriesLayer,
)

export const makeInMemoryDomainTestLayer = (
  seed?: Parameters<typeof makeInMemoryRepositoriesLayer>[0],
) => makeDomainLayer(makeInMemoryRepositoriesLayer(seed))

export const SqlDomainTestLayer = makeDomainLayer(SqlRepositoriesTestLayer)

export const makeSqlDomainTestLayer = (options?: { readonly seed?: boolean }) =>
  makeDomainLayer(makeSqlRepositoriesTestLayer(options))
