import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { todoFixtures } from "@/test/fixtures"
import { TodoList } from "./TodoList"

describe("TodoList", () => {
  it("renders todo completion state and invokes toggle callbacks", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()

    render(
      <TodoList
        todos={[todoFixtures.open, todoFixtures.completed]}
        onToggle={onToggle}
      />,
    )

    await user.click(
      screen.getByRole("button", {
        name: "Mark as complete: Draft the launch email",
      }),
    )

    expect(
      screen.getByRole("button", {
        name: "Mark as incomplete: Create the QA checklist",
      }),
    ).toHaveAttribute("aria-pressed", "true")
    expect(onToggle).toHaveBeenCalledWith(todoFixtures.open)
  })
})
