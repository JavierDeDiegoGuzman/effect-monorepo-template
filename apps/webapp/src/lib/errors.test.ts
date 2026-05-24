import {
  InternalServerError,
  InvalidCredentials,
  makeTodoId,
  TodoNotFound,
} from "@app/shared"
import { assert, describe, it } from "vitest"
import { toErrorMessage } from "./errors"

describe("toErrorMessage", () => {
  it("uses fixed messages from public typed errors", () => {
    assert.strictEqual(
      toErrorMessage(new InvalidCredentials()),
      "Invalid email or password",
    )
    assert.strictEqual(
      toErrorMessage(
        new TodoNotFound({
          id: makeTodoId("00000000-0000-4000-8000-000000000999"),
        }),
      ),
      "Todo not found",
    )
    assert.strictEqual(
      toErrorMessage(new InternalServerError()),
      "Something went wrong",
    )
  })

  it("uses public error-like message objects from typed clients", () => {
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
