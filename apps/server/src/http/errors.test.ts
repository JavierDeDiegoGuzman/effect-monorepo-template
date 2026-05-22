import { InternalServerError } from "@app/shared"
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { RepositoryError } from "../errors/repository"
import { withHttpErrorMapping } from "./errors"

const assertInternalServerError = (error: unknown) => {
  assert.strictEqual(
    (error as { readonly _tag?: string })._tag,
    "InternalServerError",
  )
  assert.strictEqual(
    (error as { readonly message?: string }).message,
    "Something went wrong",
  )
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

      assertInternalServerError(error)
      assert.ok(error instanceof InternalServerError)
    }),
  )

  it.effect("maps defects to InternalServerError", () =>
    Effect.gen(function* () {
      const error = yield* withHttpErrorMapping(
        Effect.die("unexpected defect"),
      ).pipe(Effect.flip)

      assertInternalServerError(error)
      assert.ok(error instanceof InternalServerError)
    }),
  )
})
