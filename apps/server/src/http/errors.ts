import { InternalServerError } from "@app/shared"
import { Effect } from "effect"
import { RepositoryError } from "../errors/repository"

export const withHttpErrorMapping = <A, E, R>(
  effect: Effect.Effect<A, E | RepositoryError, R>,
) =>
  effect.pipe(
    Effect.catchTag("RepositoryError", (caught) => {
      const message =
        caught instanceof RepositoryError
          ? `Repository failure mapped at HTTP seam: ${caught.repository}.${caught.operation}`
          : "Repository failure mapped at HTTP seam"

      return Effect.logError(message).pipe(
        Effect.andThen(Effect.fail(new InternalServerError())),
      )
    }),
    Effect.catchDefect(() =>
      Effect.logError("Unexpected defect mapped at HTTP seam").pipe(
        Effect.andThen(Effect.fail(new InternalServerError())),
      ),
    ),
  )
