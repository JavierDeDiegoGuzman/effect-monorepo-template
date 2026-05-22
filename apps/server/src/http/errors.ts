import { InternalServerError } from "@app/shared"
import { Effect } from "effect"
import type { RepositoryError } from "../errors/repository"

export const withHttpErrorMapping = <A, E, R>(
  effect: Effect.Effect<A, E | RepositoryError, R>,
) =>
  effect.pipe(
    Effect.catchTag("RepositoryError", () =>
      Effect.fail(new InternalServerError()),
    ),
    Effect.catchDefect(() => Effect.fail(new InternalServerError())),
  )
