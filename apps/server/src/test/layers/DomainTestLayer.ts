import { Layer } from "effect"
import type { Transactions } from "../../database/transactions"
import type { ProjectsRepository } from "../../modules/projects"
import { ProjectsLive } from "../../modules/projects"
import type { TodosRepository } from "../../modules/todos"
import { TodosLive } from "../../modules/todos"
import type { UsersRepository } from "../../modules/users"
import { UsersLive } from "../../modules/users"
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
  | ProjectsRepository
  | TodosRepository
  | Transactions

const makeDomainLayer = <Requirements>(
  repositoriesLayer: Layer.Layer<Repositories, Requirements, never>,
) => {
  const coreDomainLayer = Layer.mergeAll(UsersLive, ProjectsLive).pipe(
    Layer.provide(repositoriesLayer),
  )

  const todosDomainLayer = TodosLive.pipe(
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
