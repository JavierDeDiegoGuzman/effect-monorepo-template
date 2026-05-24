import type { Meta, StoryObj } from "@storybook/react-vite"
import { RegisterForm } from "./RegisterForm"

const meta = {
  title: "Domain/Auth/RegisterForm",
  component: RegisterForm,
  parameters: {
    layout: "padded",
  },
  args: {
    name: "",
    email: "",
    password: "",
    pending: false,
    onNameChange: () => undefined,
    onEmailChange: () => undefined,
    onPasswordChange: () => undefined,
    onSubmit: (event) => event.preventDefault(),
  },
} satisfies Meta<typeof RegisterForm>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Filled: Story = {
  args: {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "correct-horse-battery-staple",
  },
}

export const Pending: Story = {
  args: {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "correct-horse-battery-staple",
    pending: true,
  },
}
