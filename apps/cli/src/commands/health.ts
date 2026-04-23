import { Console, Effect } from "effect"
import { Command, Flag } from "effect/unstable/cli"
import { ApiClient } from "../api/client"
import { writeJson } from "../output"

export const health = Command.make(
  "health",
  {
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print machine-readable output"),
    ),
  },
  Effect.fn(function* ({ json }) {
    const client = yield* ApiClient
    yield* client.health()

    if (json) {
      yield* writeJson({ ok: true })
      return
    }

    yield* Console.log("Server is healthy")
  }),
).pipe(Command.withDescription("Check server health"))
