import { Config, Effect } from "effect"

export const getSqliteConfig = Effect.gen(function* () {
  return {
    filename: yield* Config.nonEmptyString("SQLITE_FILENAME").pipe(
      Config.withDefault("./.data/app.db"),
    ),
  } as const
})
