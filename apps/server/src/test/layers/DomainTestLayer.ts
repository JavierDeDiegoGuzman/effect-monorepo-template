import { makeProductDomainLayer } from "../../layers/ServerLayers"
import {
  InMemoryRepositoriesLayer,
  makeInMemoryRepositoriesLayer,
} from "./InMemoryRepositoriesLayer"
import {
  makeSqlRepositoriesTestLayer,
  SqlRepositoriesTestLayer,
} from "@app/backend-infra/test/layers"

export const InMemoryDomainTestLayer = makeProductDomainLayer(
  InMemoryRepositoriesLayer,
)

export const makeInMemoryDomainTestLayer = (
  seed?: Parameters<typeof makeInMemoryRepositoriesLayer>[0],
) => makeProductDomainLayer(makeInMemoryRepositoriesLayer(seed))

export const SqlDomainTestLayer = makeProductDomainLayer(
  SqlRepositoriesTestLayer,
)

export const makeSqlDomainTestLayer = (options?: { readonly seed?: boolean }) =>
  makeProductDomainLayer(makeSqlRepositoriesTestLayer(options))
