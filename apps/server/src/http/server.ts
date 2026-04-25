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

const RepositoryLayer = Layer.mergeAll(
  SqlUsersRepositoryLayer,
  SqlWorkspacesRepositoryLayer,
  SqlProjectsRepositoryLayer,
  SqlTodosRepositoryLayer,
  SqlTransactionsLayer,
).pipe(Layer.provide(SqliteLayer))

const CoreDomainLayer = Layer.mergeAll(
  Users.layer,
  Workspaces.layer,
  Projects.layer,
).pipe(Layer.provide(RepositoryLayer), Layer.provide(SqliteLayer))

const TodosDomainLayer = Todos.layer.pipe(
  Layer.provideMerge(CoreDomainLayer),
  Layer.provide(RepositoryLayer),
)

const DomainLayer = Layer.mergeAll(CoreDomainLayer, TodosDomainLayer)

export const HttpServerDependenciesLayer = Layer.mergeAll(
  SqliteLayer,
  RepositoryLayer,
  DomainLayer,
  AuthTokens.layer,
  Passwords.layer,
)

const ApiRoutes = HttpApiBuilder.layer(Api, {
  openapiPath: "/openapi.json",
}).pipe(
  Layer.provide([
    AuthApiHandlers.pipe(Layer.provide(HttpServerDependenciesLayer)),
    SessionApiHandlers,
    ProjectsApiHandlers.pipe(Layer.provide(HttpServerDependenciesLayer)),
    TodosApiHandlers.pipe(Layer.provide(HttpServerDependenciesLayer)),
    SystemApiHandlers,
  ]),
  Layer.provide(
    AuthorizationLayer.pipe(Layer.provide(HttpServerDependenciesLayer)),
  ),
)

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
