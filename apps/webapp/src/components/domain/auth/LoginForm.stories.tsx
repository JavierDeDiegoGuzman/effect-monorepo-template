import type { Meta, StoryObj } from "@storybook/react-vite"
import { LoginForm } from "./LoginForm"

const meta = {
  title: "Domain/Auth/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "padded",
  },
  args: {
    email: "",
    password: "",
    pending: false,
    onEmailChange: () => undefined,
    onPasswordChange: () => undefined,
    onSubmit: (event) => event.preventDefault(),
  },
} satisfies Meta<typeof LoginForm>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Filled: Story = {
  args: {
    email: "ada@example.com",
    password: "correct-horse-battery-staple",
  },
}

export const Pending: Story = {
  args: {
    email: "ada@example.com",
    password: "correct-horse-battery-staple",
    pending: true,
  },
}
