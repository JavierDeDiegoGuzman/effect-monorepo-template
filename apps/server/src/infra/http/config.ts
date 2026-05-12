import { Config, Effect } from "effect"

export const getHttpServerConfig = Effect.gen(function* () {
  return {
    port: yield* Config.port("PORT").pipe(Config.withDefault(3001)),
  } as const
})
