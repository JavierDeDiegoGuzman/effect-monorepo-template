import { AuthLive, TodosLive, UsersLive } from "@app/backend-domain"
import {
  AuthTokensLive,
  makeSqliteRepositoryLayer,
  PasswordsLive,
  PostgresRepositoriesLayer,
  type SqlRepositoryLayerError,
  type SqlRepositoryServices,
} from "@app/backend-infra"
import { Layer } from "effect"
import { AuthSessionCookiesLive } from "../modules/auth/session-cookie"

type RepositoryServices = SqlRepositoryServices

type RepositoryLayerError = SqlRepositoryLayerError

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
