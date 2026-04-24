import { createServer } from "node:http"
import { Api } from "@app/shared"
import { NodeHttpServer } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { HttpRouter } from "effect/unstable/http"
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi"
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

const ServicesLayer = Layer.mergeAll(
  AuthTokens.layer,
  Passwords.layer,
  Projects.layer,
  Todos.layer,
  Workspaces.layer,
  Users.layer,
)

const ApiRoutes = HttpApiBuilder.layer(Api, {
  openapiPath: "/openapi.json",
}).pipe(
  Layer.provide([
    AuthApiHandlers.pipe(Layer.provide(ServicesLayer)),
    SessionApiHandlers,
    ProjectsApiHandlers.pipe(Layer.provide(ServicesLayer)),
    TodosApiHandlers.pipe(Layer.provide(ServicesLayer)),
    SystemApiHandlers,
  ]),
  Layer.provide(AuthorizationLayer.pipe(Layer.provide(ServicesLayer))),
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
  Effect.gen(function*() {
    const { port } = yield* getHttpServerConfig

    return HttpRouter.serve(AllRoutes).pipe(
      Layer.provide(NodeHttpServer.layer(createServer, { port })),
    )
  }),
)
