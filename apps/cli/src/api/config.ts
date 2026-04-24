import { Config, Effect } from "effect"

export const getApiClientConfig = Effect.gen(function* () {
  return {
    apiUrl: yield* Config.nonEmptyString("API_URL"),
    authToken: yield* Config.option(Config.nonEmptyString("API_AUTH_TOKEN")),
  } as const
})
