import type { Meta, StoryObj } from "@storybook/react-vite"
import { Input } from "./input"

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  args: {
    placeholder: "you@example.com",
  },
  decorators: [
    (Story) => (
      <div className="grid w-[320px] gap-2">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = {
  args: {
    value: "ada@example.com",
    readOnly: true,
  },
}

export const Disabled: Story = {
  args: {
    value: "ada@example.com",
    disabled: true,
  },
}

export const Invalid: Story = {
  args: {
    value: "not-an-email",
    readOnly: true,
    "aria-invalid": true,
  },
}
