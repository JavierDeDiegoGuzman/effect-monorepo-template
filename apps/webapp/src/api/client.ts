import { Api, Authorization } from "@app/shared"
import { Effect, flow, Layer, ServiceMap } from "effect"
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "effect/unstable/http"
import { HttpApiClient, HttpApiMiddleware } from "effect/unstable/httpapi"
import {
  clearAuthToken,
  isProbablyJwt,
  readAuthToken,
} from "../lib/auth-storage"
import { apiClientConfig } from "./config"

const AuthorizationClient = HttpApiMiddleware.layerClient(
  Authorization,
  Effect.fn(function* ({ next, request }) {
    const token = readAuthToken()

    if (token === null) {
      return yield* next(request)
    }

    if (!isProbablyJwt(token)) {
      clearAuthToken()
      return yield* next(request)
    }

    return yield* next(HttpClientRequest.bearerToken(request, token))
  }),
)

export class ApiClient extends ServiceMap.Service<
  ApiClient,
  HttpApiClient.ForApi<typeof Api>
>()("app/ApiClient") {
  static readonly layer = Layer.effect(
    ApiClient,
    HttpApiClient.make(Api, {
      transformClient: (client) =>
        client.pipe(
          HttpClient.mapRequest(
            flow(HttpClientRequest.prependUrl(apiClientConfig.apiUrl)),
          ),
        ),
    }),
  ).pipe(
    Layer.provide(AuthorizationClient),
    Layer.provide(FetchHttpClient.layer),
  )
}
