import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"
import { RegisterForm } from "./RegisterForm"

describe("RegisterForm", () => {
  it("updates controlled fields and submits through the form callback", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
    })

    function StatefulRegisterForm() {
      const [name, setName] = React.useState("")
      const [email, setEmail] = React.useState("")
      const [password, setPassword] = React.useState("")

      return (
        <RegisterForm
          name={name}
          email={email}
          password={password}
          pending={false}
          onNameChange={setName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={onSubmit}
        />
      )
    }

    render(<StatefulRegisterForm />)

    await user.type(screen.getByLabelText("Name"), "Ada Lovelace")
    await user.type(screen.getByLabelText("Email"), "ada@example.com")
    await user.type(screen.getByLabelText("Password"), "secret")
    await user.click(screen.getByRole("button", { name: "Create account" }))

    expect(screen.getByLabelText("Name")).toHaveValue("Ada Lovelace")
    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com")
    expect(screen.getByLabelText("Password")).toHaveValue("secret")
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it("disables submission while pending", () => {
    render(
      <RegisterForm
        name="Ada Lovelace"
        email="ada@example.com"
        password="secret"
        pending={true}
        onNameChange={() => undefined}
        onEmailChange={() => undefined}
        onPasswordChange={() => undefined}
        onSubmit={() => undefined}
      />,
    )

    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeDisabled()
  })
})
