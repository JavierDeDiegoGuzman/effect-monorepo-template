import type { Meta, StoryObj } from "@storybook/react-vite"
import { Checkbox } from "./checkbox"

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Checkbox>

export default meta

type Story = StoryObj<typeof meta>

export const Unchecked: Story = {
  args: {
    "aria-label": "Accept terms",
  },
}

export const Checked: Story = {
  args: {
    checked: true,
    "aria-label": "Accept terms",
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox aria-label="Disabled unchecked" disabled />
      <Checkbox aria-label="Disabled checked" checked disabled />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-sm">
      <Checkbox id="product-updates" aria-labelledby="product-updates-label" />
      <span id="product-updates-label">Receive product updates</span>
    </div>
  ),
}
