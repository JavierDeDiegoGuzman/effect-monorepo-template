import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { projectFixtures, todoFixtures } from "@/test/fixtures"
import { renderTodoProjectMeta, TodoList } from "./TodoList"

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

  it("renders optional project metadata", () => {
    render(
      <TodoList
        todos={[todoFixtures.open, todoFixtures.completed]}
        onToggle={() => undefined}
        renderMeta={renderTodoProjectMeta(
          new Map([[projectFixtures.active.id, projectFixtures.active]]),
        )}
      />,
    )

    expect(screen.getByText("Project: Launch checklist")).toBeInTheDocument()
    expect(screen.getByText("No project")).toBeInTheDocument()
  })
})
