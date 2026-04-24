import { Api, Authorization } from "@app/shared"
import { Effect, flow, Layer, Option, ServiceMap } from "effect"
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "effect/unstable/http"
import { HttpApiClient, HttpApiMiddleware } from "effect/unstable/httpapi"
import { getApiClientConfig } from "./config"

const AuthorizationClient = Layer.unwrap(
  Effect.gen(function* () {
    const { authToken } = yield* getApiClientConfig

    return HttpApiMiddleware.layerClient(
      Authorization,
      Effect.fn(function* ({ next, request }) {
        if (Option.isNone(authToken)) {
          return yield* next(request)
        }

        return yield* next(HttpClientRequest.bearerToken(request, authToken.value))
      }),
    )
  }),
)

export class ApiClient extends ServiceMap.Service<
  ApiClient,
  HttpApiClient.ForApi<typeof Api>
>()("app/cli/ApiClient") {
  static readonly layer = Layer.effect(
    ApiClient,
    Effect.gen(function* () {
      const { apiUrl } = yield* getApiClientConfig

      return yield* HttpApiClient.make(Api, {
        transformClient: (client) =>
          client.pipe(
            HttpClient.mapRequest(flow(HttpClientRequest.prependUrl(apiUrl))),
          ),
      })
    }),
  ).pipe(Layer.provide(AuthorizationClient), Layer.provide(FetchHttpClient.layer))
}
