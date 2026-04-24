import { Config, Effect, Option } from "effect"

export const getObservabilityConfig = Effect.gen(function*() {
  const environment = yield* Config
    .nonEmptyString("NODE_ENV")
    .pipe(Config.withDefault("development"))
  const endpointOption = yield* Config.option(
    Config.nonEmptyString("OTEL_EXPORTER_OTLP_ENDPOINT"),
  )
  const endpoint = Option.getOrUndefined(endpointOption)

  if (endpoint === "off") {
    return {
      enabled: false,
    } as const
  }

  const enabledEndpoint =
    endpoint ??
    (environment === "development"
      ? undefined
      : yield* Config.nonEmptyString("OTEL_EXPORTER_OTLP_ENDPOINT"))

  if (enabledEndpoint === undefined) {
    return {
      enabled: false,
    } as const
  }

  return {
    enabled: true,
    endpoint: enabledEndpoint,
    serviceName: yield* Config.nonEmptyString("OTEL_SERVICE_NAME"),
    serviceVersion: yield* Config.nonEmptyString("OTEL_SERVICE_VERSION"),
    environment,
  } as const
})
