import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"
import { LoginForm } from "./LoginForm"

describe("LoginForm", () => {
  it("updates controlled fields and submits through the form callback", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
    })

    function StatefulLoginForm() {
      const [email, setEmail] = React.useState("")
      const [password, setPassword] = React.useState("")

      return (
        <LoginForm
          email={email}
          password={password}
          pending={false}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={onSubmit}
        />
      )
    }

    render(<StatefulLoginForm />)

    await user.type(screen.getByLabelText("Email"), "ada@example.com")
    await user.type(screen.getByLabelText("Password"), "secret")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com")
    expect(screen.getByLabelText("Password")).toHaveValue("secret")
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it("disables submission while pending", () => {
    render(
      <LoginForm
        email="ada@example.com"
        password="secret"
        pending={true}
        onEmailChange={() => undefined}
        onPasswordChange={() => undefined}
        onSubmit={() => undefined}
      />,
    )

    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled()
  })
})
