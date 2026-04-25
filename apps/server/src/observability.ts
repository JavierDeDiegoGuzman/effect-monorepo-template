import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { Otlp } from "effect/unstable/observability"
import { getObservabilityConfig } from "./observability.config"

export const ObservabilityLayer = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* getObservabilityConfig

    if (!config.enabled) {
      return Layer.empty
    }

    return Otlp.layerJson({
      baseUrl: config.endpoint,
      resource: {
        serviceName: config.serviceName,
        serviceVersion: config.serviceVersion,
        attributes: {
          "deployment.environment": config.environment,
        },
      },
    }).pipe(Layer.provide(FetchHttpClient.layer))
  }),
)
