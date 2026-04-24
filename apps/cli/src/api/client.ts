import { Api } from "@app/shared"
import { Effect, flow, Layer, ServiceMap } from "effect"
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"
import { getApiClientConfig } from "./config"

export class ApiClient extends ServiceMap.Service<
  ApiClient,
  HttpApiClient.ForApi<typeof Api>
>()("app/cli/ApiClient") {
  static readonly layer = Layer.effect(
    ApiClient,
    Effect.gen(function*() {
      const { apiUrl } = yield* getApiClientConfig

      return yield* HttpApiClient.make(Api, {
        transformClient: (client) =>
          client.pipe(
            HttpClient.mapRequest(flow(HttpClientRequest.prependUrl(apiUrl))),
          ),
      })
    }),
  ).pipe(Layer.provide(FetchHttpClient.layer))
}
