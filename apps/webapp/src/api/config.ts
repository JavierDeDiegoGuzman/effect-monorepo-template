function getEnvWithDefault(name: "VITE_API_URL", fallback: string) {
  const value = import.meta.env[name]

  if (typeof value !== "string" || value.length === 0) {
    return fallback
  }

  return value
}

export const apiClientConfig = {
  apiUrl: getEnvWithDefault("VITE_API_URL", "http://localhost:3001"),
} as const
