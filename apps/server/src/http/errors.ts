import { InternalServerError } from "@app/shared"
import { Effect } from "effect"
import type { RepositoryError } from "../errors/repository"

export const withHttpErrorMapping = <A, E, R>(
  effect: Effect.Effect<A, E | RepositoryError, R>,
) =>
  effect.pipe(
    Effect.catchTag("RepositoryError", (caught) => {
      const error = caught as RepositoryError
      return Effect.logError(
        `Repository failure mapped at HTTP seam: ${error.repository}.${error.operation}`,
      ).pipe(Effect.andThen(Effect.fail(new InternalServerError())))
    }),
    Effect.catchDefect(() =>
      Effect.logError("Unexpected defect mapped at HTTP seam").pipe(
        Effect.andThen(Effect.fail(new InternalServerError())),
      ),
    ),
  )
