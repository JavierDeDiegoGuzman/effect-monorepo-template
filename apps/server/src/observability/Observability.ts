import { Config, Effect, Layer, Option } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { Otlp } from "effect/unstable/observability"

export const ObservabilityLayer = Layer.unwrap(
  Effect.gen(function* () {
    const environment = yield* Config.nonEmptyString("NODE_ENV").pipe(
      Config.withDefault("development"),
    )
    const endpointOption = yield* Config.option(
      Config.nonEmptyString("OTEL_EXPORTER_OTLP_ENDPOINT"),
    )
    const endpoint = Option.getOrUndefined(endpointOption)

    if (endpoint === "off") {
      return Layer.empty
    }

    const enabledEndpoint =
      endpoint ??
      (environment === "development"
        ? undefined
        : yield* Config.nonEmptyString("OTEL_EXPORTER_OTLP_ENDPOINT"))

    if (enabledEndpoint === undefined) {
      return Layer.empty
    }

    return Otlp.layerJson({
      baseUrl: enabledEndpoint,
      resource: {
        serviceName: yield* Config.nonEmptyString("OTEL_SERVICE_NAME"),
        serviceVersion: yield* Config.nonEmptyString("OTEL_SERVICE_VERSION"),
        attributes: {
          "deployment.environment": environment,
        },
      },
    }).pipe(Layer.provide(FetchHttpClient.layer))
  }),
)
