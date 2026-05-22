import { createServer } from "node:http"
import { Api } from "@app/shared"
import { NodeHttpServer } from "@effect/platform-node"
import { Config, Effect, Layer } from "effect"
import { HttpRouter } from "effect/unstable/http"
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi"
import { HttpServerDependenciesLayer } from "../layers/ServerLayers"
import { AuthApiHandlers, SessionApiHandlers } from "../modules/auth"
import { SystemApiHandlers } from "../modules/system"
import { TodosApiHandlers } from "../modules/todos"
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
      TodosApiHandlers.pipe(Layer.provide(dependenciesLayer)),
      SystemApiHandlers,
    ]),
    Layer.provide(AuthorizationLayer.pipe(Layer.provide(dependenciesLayer))),
  )

const DocsRoute = HttpApiScalar.layer(Api, {
  path: "/docs",
})

const CorsLayer = HttpRouter.cors({
  allowedOrigins: ["http://localhost:5173"],
  allowedMethods: ["GET", "POST", "PATCH", "OPTIONS"],
})

export const makeHttpServerLayer = (
  dependenciesLayer = HttpServerDependenciesLayer,
) => {
  const allRoutes = Layer.mergeAll(
    makeApiRoutesLayer(dependenciesLayer),
    DocsRoute,
    CorsLayer,
  )

  return Layer.unwrap(
    Effect.gen(function* () {
      const port = yield* Config.port("PORT")

      return HttpRouter.serve(allRoutes).pipe(
        Layer.provide(NodeHttpServer.layer(createServer, { port })),
      )
    }),
  )
}

export const HttpServerLayer = makeHttpServerLayer()
