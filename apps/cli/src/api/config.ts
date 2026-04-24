import { Config, Effect } from "effect"

export const getApiClientConfig = Effect.gen(function*() {
  return {
    apiUrl: yield* Config.nonEmptyString("API_URL"),
  } as const
})
