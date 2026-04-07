import * as Layer from "effect/Layer"
import { FetchHttpClient } from "effect/unstable/http"
import { Otlp } from "effect/unstable/observability"

const baseUrl = import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318"
const serviceName = import.meta.env.VITE_OTEL_SERVICE_NAME ?? "todo-webapp"
const serviceVersion = import.meta.env.VITE_OTEL_SERVICE_VERSION ?? "0.1.0"

export const ObservabilityLayer = baseUrl === "off"
  ? Layer.empty
  : Otlp.layerJson({
      baseUrl,
      resource: {
        serviceName,
        serviceVersion,
        attributes: {
          "deployment.environment": import.meta.env.MODE
        }
      }
    }).pipe(
      Layer.provide(FetchHttpClient.layer)
    )
