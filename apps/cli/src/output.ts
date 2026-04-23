import { Console, Effect } from "effect"

export const writeJson = (value: unknown) =>
  Console.log(JSON.stringify(value, null, 2))

export const writeLine = (value: string) => Console.log(value)

export const fail = (message: string) => Effect.fail(new Error(message))
