import { Api } from "@app/shared"
import { flow, Layer, ServiceMap } from "effect"
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001"

export class ApiClient extends ServiceMap.Service<
  ApiClient,
  HttpApiClient.ForApi<typeof Api>
>()("app/ApiClient") {
  static readonly layer = Layer.effect(
    ApiClient,
    HttpApiClient.make(Api, {
      transformClient: (client) =>
        client.pipe(
          HttpClient.mapRequest(flow(HttpClientRequest.prependUrl(apiUrl))),
        ),
    }),
  ).pipe(Layer.provide(FetchHttpClient.layer))
}
