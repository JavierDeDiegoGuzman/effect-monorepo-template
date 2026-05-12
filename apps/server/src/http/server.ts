import { createServer } from "node:http"
import { Api } from "@app/shared"
import { NodeHttpServer } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { HttpRouter } from "effect/unstable/http"
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi"
import { getHttpServerConfig } from "../infra/http/config"
import { HttpServerDependenciesLayer } from "../layers/ServerLayers"
import { AuthApiHandlers, SessionApiHandlers } from "./handlers/Auth"
import { ProjectsApiHandlers } from "./handlers/Projects"
import { SystemApiHandlers } from "./handlers/System"
import { TodosApiHandlers } from "./handlers/Todos"
import { AuthorizationLayer } from "./middleware/Authorization"

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
