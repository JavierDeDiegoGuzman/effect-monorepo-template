import * as Layer from "effect/Layer"
import { FetchHttpClient } from "effect/unstable/http"
import { Otlp } from "effect/unstable/observability"
import { observabilityConfig } from "./observability.config"

export const ObservabilityLayer = !observabilityConfig.enabled
  ? Layer.empty
  : Otlp.layerJson({
      baseUrl: observabilityConfig.endpoint,
      resource: {
        serviceName: observabilityConfig.serviceName,
        serviceVersion: observabilityConfig.serviceVersion,
        attributes: {
          "deployment.environment": observabilityConfig.environment,
        },
      },
    }).pipe(Layer.provide(FetchHttpClient.layer))
