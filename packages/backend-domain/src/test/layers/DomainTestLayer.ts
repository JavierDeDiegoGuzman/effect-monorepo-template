import { Layer } from "effect"
import { TodosLive } from "../../modules/todos/service.live"
import { UsersLive } from "../../modules/users/service.live"
import {
  InMemoryRepositoriesLayer,
  makeInMemoryRepositoriesLayer,
} from "./InMemoryRepositoriesLayer"

export const InMemoryProductDomainTestLayer = Layer.mergeAll(
  UsersLive,
  TodosLive,
).pipe(Layer.provide(InMemoryRepositoriesLayer))

export const makeInMemoryProductDomainTestLayer = (
  seed?: Parameters<typeof makeInMemoryRepositoriesLayer>[0],
) =>
  Layer.mergeAll(UsersLive, TodosLive).pipe(
    Layer.provide(makeInMemoryRepositoriesLayer(seed)),
  )
