import { createServer } from "node:http"
import { Api } from "@app/shared"
import { NodeHttpServer } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { HttpRouter } from "effect/unstable/http"
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi"
import { SqliteLayer } from "../infra/sql/Sqlite"
import { SqlProjectsRepositoryLayer } from "../repositories/sql/SqlProjectsRepository"
import { SqlTodosRepositoryLayer } from "../repositories/sql/SqlTodosRepository"
import { SqlTransactionsLayer } from "../repositories/sql/SqlTransactions"
import { SqlUsersRepositoryLayer } from "../repositories/sql/SqlUsersRepository"
import { SqlWorkspacesRepositoryLayer } from "../repositories/sql/SqlWorkspacesRepository"
import { AuthTokens } from "../services/AuthTokens"
import { Passwords } from "../services/Passwords"
import { Projects } from "../services/Projects"
import { Todos } from "../services/Todos"
import { Users } from "../services/Users"
import { Workspaces } from "../services/Workspaces"
import { getHttpServerConfig } from "./config"
import { AuthApiHandlers, SessionApiHandlers } from "./handlers/Auth"
import { ProjectsApiHandlers } from "./handlers/Projects"
import { SystemApiHandlers } from "./handlers/System"
import { TodosApiHandlers } from "./handlers/Todos"
import { AuthorizationLayer } from "./middleware/Authorization"

export const makeRepositoryLayer = (sqliteLayer = SqliteLayer) =>
  Layer.mergeAll(
    SqlUsersRepositoryLayer,
    SqlWorkspacesRepositoryLayer,
    SqlProjectsRepositoryLayer,
    SqlTodosRepositoryLayer,
    SqlTransactionsLayer,
  ).pipe(Layer.provide(sqliteLayer))

export const makeDomainLayer = (
  repositoryLayer = makeRepositoryLayer(),
  sqliteLayer = SqliteLayer,
) => {
  const coreDomainLayer = Layer.mergeAll(
    Users.layer,
    Workspaces.layer,
    Projects.layer,
  ).pipe(Layer.provide(repositoryLayer), Layer.provide(sqliteLayer))

  const todosDomainLayer = Todos.layer.pipe(
    Layer.provideMerge(coreDomainLayer),
    Layer.provide(repositoryLayer),
  )

  return Layer.mergeAll(coreDomainLayer, todosDomainLayer)
}

export const makeHttpServerDependenciesLayer = (sqliteLayer = SqliteLayer) => {
  const repositoryLayer = makeRepositoryLayer(sqliteLayer)
  const domainLayer = makeDomainLayer(repositoryLayer, sqliteLayer)

  return Layer.mergeAll(
    sqliteLayer,
    repositoryLayer,
    domainLayer,
    AuthTokens.layer,
    Passwords.layer,
  )
}

export const HttpServerDependenciesLayer = makeHttpServerDependenciesLayer()

export const makeApiRoutesLayer = (
  dependenciesLayer = HttpServerDependenciesLayer,
) =>
  HttpApiBuilder.layer(Api, {
    openapiPath: "/openapi.json",
  }).pipe(
    Layer.provide([
      AuthApiHandlers.pipe(Layer.provide(dependenciesLayer)),
      SessionApiHandlers,
      ProjectsApiHandlers.pipe(Layer.provide(dependenciesLayer)),
      TodosApiHandlers.pipe(Layer.provide(dependenciesLayer)),
      SystemApiHandlers,
    ]),
    Layer.provide(AuthorizationLayer.pipe(Layer.provide(dependenciesLayer))),
  )

const ApiRoutes = makeApiRoutesLayer()

const DocsRoute = HttpApiScalar.layer(Api, {
  path: "/docs",
})

const CorsLayer = HttpRouter.cors({
  allowedOrigins: ["http://localhost:5173"],
  allowedMethods: ["GET", "POST", "PATCH", "OPTIONS"],
})

const AllRoutes = Layer.mergeAll(ApiRoutes, DocsRoute, CorsLayer)

export const HttpServerLayer = Layer.unwrap(
  Effect.gen(function* () {
    const { port } = yield* getHttpServerConfig

    return HttpRouter.serve(AllRoutes).pipe(
      Layer.provide(NodeHttpServer.layer(createServer, { port })),
    )
  }),
)
