import { Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { Otlp } from "effect/unstable/observability"

const baseUrl =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318"
const serviceName = process.env.OTEL_SERVICE_NAME ?? "todo-server"
const serviceVersion = process.env.OTEL_SERVICE_VERSION ?? "0.1.0"

export const ObservabilityLayer =
  baseUrl === "off"
    ? Layer.empty
    : Otlp.layerJson({
        baseUrl,
        resource: {
          serviceName,
          serviceVersion,
          attributes: {
            "deployment.environment": process.env.NODE_ENV ?? "development",
          },
        },
      }).pipe(Layer.provide(FetchHttpClient.layer))
