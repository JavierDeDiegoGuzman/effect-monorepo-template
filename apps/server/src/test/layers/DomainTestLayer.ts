import { Layer } from "effect"
import type { ProjectsRepository } from "../../repositories/ProjectsRepository"
import type { TodosRepository } from "../../repositories/TodosRepository"
import type { Transactions } from "../../repositories/Transactions"
import type { UsersRepository } from "../../repositories/UsersRepository"
import { Projects } from "../../services/Projects"
import { Todos } from "../../services/Todos"
import { Users } from "../../services/Users"
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
  const coreDomainLayer = Layer.mergeAll(Users.layer, Projects.layer).pipe(
    Layer.provide(repositoriesLayer),
  )

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
