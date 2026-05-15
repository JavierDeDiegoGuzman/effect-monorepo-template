import { Layer } from "effect"
import type { Transactions } from "../../database/transactions"
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

type Repositories = UsersRepository | TodosRepository | Transactions

const makeDomainLayer = <Requirements>(
  repositoriesLayer: Layer.Layer<Repositories, Requirements, never>,
) => Layer.mergeAll(UsersLive, TodosLive).pipe(Layer.provide(repositoriesLayer))

export const InMemoryDomainTestLayer = makeDomainLayer(
  InMemoryRepositoriesLayer,
)

export const makeInMemoryDomainTestLayer = (
  seed?: Parameters<typeof makeInMemoryRepositoriesLayer>[0],
) => makeDomainLayer(makeInMemoryRepositoriesLayer(seed))

export const SqlDomainTestLayer = makeDomainLayer(SqlRepositoriesTestLayer)

export const makeSqlDomainTestLayer = (options?: { readonly seed?: boolean }) =>
  makeDomainLayer(makeSqlRepositoriesTestLayer(options))
