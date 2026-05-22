import { Api } from "@app/shared"
import { Context, flow, Layer } from "effect"
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "effect/unstable/http"
import { HttpApiClient } from "effect/unstable/httpapi"
import { apiClientConfig } from "./config"

const fetchWithoutContentLength: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers)
  headers.delete("content-length")
  return fetch(input, { ...init, headers, credentials: "include" })
}

export class ApiClient extends Context.Service<
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
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(
      Layer.succeed(FetchHttpClient.Fetch, fetchWithoutContentLength),
    ),
  )
}
