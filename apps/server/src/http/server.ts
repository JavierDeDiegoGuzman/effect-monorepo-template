import { createServer } from "node:http"
import { Api } from "@app/shared"
import { NodeHttpServer } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { HttpRouter } from "effect/unstable/http"
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi"
import { ProjectsApiHandlers } from "./handlers/Projects"
import { SystemApiHandlers } from "./handlers/System"
import { TodosApiHandlers } from "./handlers/Todos"
import { getHttpServerConfig } from "./config"

const ApiRoutes = HttpApiBuilder.layer(Api, {
  openapiPath: "/openapi.json",
}).pipe(
  Layer.provide([ProjectsApiHandlers, TodosApiHandlers, SystemApiHandlers]),
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
