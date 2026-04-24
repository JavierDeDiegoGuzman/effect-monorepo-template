type RequiredEnvName =
  | "VITE_OTEL_EXPORTER_OTLP_ENDPOINT"
  | "VITE_OTEL_SERVICE_NAME"
  | "VITE_OTEL_SERVICE_VERSION"

type OptionalEnvName = "VITE_OTEL_EXPORTER_OTLP_ENDPOINT"

function getRequiredEnv(name: RequiredEnvName) {
  const value = import.meta.env[name]

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getOptionalEnv(name: OptionalEnvName) {
  const value = import.meta.env[name]

  if (typeof value !== "string" || value.length === 0) {
    return undefined
  }

  return value
}

const environment = import.meta.env.MODE
const endpoint = getOptionalEnv("VITE_OTEL_EXPORTER_OTLP_ENDPOINT")
const enabledEndpoint =
  endpoint ??
  (environment === "development"
    ? undefined
    : getRequiredEnv("VITE_OTEL_EXPORTER_OTLP_ENDPOINT"))

export const observabilityConfig =
  enabledEndpoint === undefined || enabledEndpoint === "off"
    ? ({
        enabled: false,
      } as const)
    : ({
        enabled: true,
        endpoint: enabledEndpoint,
        serviceName: getRequiredEnv("VITE_OTEL_SERVICE_NAME"),
        serviceVersion: getRequiredEnv("VITE_OTEL_SERVICE_VERSION"),
        environment,
      } as const)
