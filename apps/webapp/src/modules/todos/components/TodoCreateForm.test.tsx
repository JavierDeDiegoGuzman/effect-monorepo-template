import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"
import { TodoCreateForm } from "./TodoCreateForm"

describe("TodoCreateForm", () => {
  it("updates the controlled title and submits through the form callback", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
    })

    function StatefulTodoCreateForm() {
      const [title, setTitle] = React.useState("")

      return (
        <TodoCreateForm
          title={title}
          pending={false}
          onTitleChange={setTitle}
          onSubmit={onSubmit}
        />
      )
    }

    render(<StatefulTodoCreateForm />)

    await user.type(screen.getByLabelText("Todo title"), "Review the template")
    await user.click(screen.getByRole("button", { name: "Add todo" }))

    expect(screen.getByLabelText("Todo title")).toHaveValue(
      "Review the template",
    )
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it("disables submission while pending", () => {
    render(
      <TodoCreateForm
        title="Review the template"
        pending={true}
        onTitleChange={() => undefined}
        onSubmit={() => undefined}
      />,
    )

    expect(screen.getByRole("button", { name: "Add todo" })).toBeDisabled()
  })
})
