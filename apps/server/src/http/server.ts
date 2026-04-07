import { Api } from "@app/shared"
import { NodeHttpServer } from "@effect/platform-node"
import { Layer } from "effect"
import { HttpRouter } from "effect/unstable/http"
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi"
import { createServer } from "node:http"
import { TodosApiHandlers } from "./handlers/Todos"

const ApiRoutes = HttpApiBuilder.layer(Api, {
  openapiPath: "/openapi.json"
}).pipe(
  Layer.provide(TodosApiHandlers)
)

const DocsRoute = HttpApiScalar.layer(Api, {
  path: "/docs"
})

const CorsLayer = HttpRouter.cors({
  allowedOrigins: ["http://localhost:5173"],
  allowedMethods: ["GET", "POST", "PATCH", "OPTIONS"]
})

const AllRoutes = Layer.mergeAll(ApiRoutes, DocsRoute, CorsLayer)

export const HttpServerLayer = HttpRouter.serve(AllRoutes).pipe(
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
)
