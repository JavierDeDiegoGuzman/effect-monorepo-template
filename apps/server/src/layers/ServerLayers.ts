import {
  AuthLive,
  InMemoryTransactionsLayer,
  TodosLive,
  UsersLive,
  makeInMemoryAuthCredentialsRepositoryLayer,
  makeInMemoryTodosRepositoryLayer,
  makeInMemoryUsersRepositoryLayer,
} from "@app/backend-domain"
import {
  AuthTokensLive,
  PasswordsLive,
  PostgresRepositoriesLayer,
  type SqlRepositoryLayerError,
  type SqlRepositoryServices,
  makeSqliteRepositoryLayer,
} from "@app/backend-infra"
import type { Todo, User } from "@app/shared"
import { Layer } from "effect"
import { AuthSessionCookiesLive } from "../modules/auth/session-cookie"

export type InMemoryRepositorySeed = {
  readonly users?: ReadonlyArray<{
    readonly user: User
    readonly passwordHash: string
  }>
  readonly todos?: ReadonlyArray<Todo>
}

type RepositoryServices = SqlRepositoryServices

type RepositoryLayerError = SqlRepositoryLayerError

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

export const MemoryRepositoriesLayer = makeInMemoryRepositoriesLayer()

export const makeProductDomainLayer = (
  repositoryLayer: Layer.Layer<
    RepositoryServices,
    RepositoryLayerError
  > = PostgresRepositoriesLayer,
) => Layer.mergeAll(UsersLive, TodosLive).pipe(Layer.provide(repositoryLayer))

export const makeAuthDomainLayer = (
  repositoryLayer: Layer.Layer<
    RepositoryServices,
    RepositoryLayerError
  > = PostgresRepositoriesLayer,
  productDomainLayer = makeProductDomainLayer(repositoryLayer),
) =>
  AuthLive.pipe(
    Layer.provide(
      Layer.mergeAll(
        repositoryLayer,
        productDomainLayer,
        PasswordsLive,
        AuthTokensLive,
      ),
    ),
  )

export const makeDomainLayer = (
  repositoryLayer: Layer.Layer<
    RepositoryServices,
    RepositoryLayerError
  > = PostgresRepositoriesLayer,
) => {
  const productDomainLayer = makeProductDomainLayer(repositoryLayer)

  return Layer.mergeAll(
    productDomainLayer,
    makeAuthDomainLayer(repositoryLayer, productDomainLayer),
  )
}

export const makeHttpServerDependenciesLayer = (
  repositoryLayer: Layer.Layer<
    RepositoryServices,
    RepositoryLayerError
  > = PostgresRepositoriesLayer,
) => {
  const domainLayer = makeDomainLayer(repositoryLayer)

  return Layer.mergeAll(repositoryLayer, domainLayer, AuthSessionCookiesLive)
}

export const DevServerDependenciesLayer = makeHttpServerDependenciesLayer(
  makeSqliteRepositoryLayer(),
)

export const ProdServerDependenciesLayer = makeHttpServerDependenciesLayer(
  PostgresRepositoriesLayer,
)

export const HttpServerDependenciesLayer = ProdServerDependenciesLayer
