import { RepositoryError } from "@app/backend-domain"
import { InternalServerError } from "@app/shared"
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { withHttpErrorMapping } from "./errors"

const assertInternalServerError = (error: InternalServerError) => {
  assert.strictEqual(error._tag, "InternalServerError")
  assert.strictEqual(error.message, "Something went wrong")
}

describe("HTTP error mapping", () => {
  it.effect("maps repository errors to InternalServerError", () =>
    Effect.gen(function* () {
      const error = yield* withHttpErrorMapping(
        Effect.fail(
          new RepositoryError({
            repository: "TodosRepository",
            operation: "listByUser",
          }),
        ),
      ).pipe(Effect.flip)

      assert.ok(error instanceof InternalServerError)
      assertInternalServerError(error)
    }),
  )

  it.effect("maps defects to InternalServerError", () =>
    Effect.gen(function* () {
      const error = yield* withHttpErrorMapping(
        Effect.die("unexpected defect"),
      ).pipe(Effect.flip)

      assert.ok(error instanceof InternalServerError)
      assertInternalServerError(error)
    }),
  )
})
