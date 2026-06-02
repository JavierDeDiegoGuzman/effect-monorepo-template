import { assert, describe, it } from "vitest"
import { toErrorMessage } from "./errors"

describe("toErrorMessage", () => {
  it("uses public error-like message objects", () => {
    assert.strictEqual(
      toErrorMessage({
        _tag: "Unauthorized",
        message: "Authentication required",
      }),
      "Authentication required",
    )
  })

  it("falls back for unknown errors", () => {
    assert.strictEqual(
      toErrorMessage("Network unavailable"),
      "Network unavailable",
    )
    assert.strictEqual(toErrorMessage({ _tag: "Unknown" }), "Unexpected error")
  })
})
