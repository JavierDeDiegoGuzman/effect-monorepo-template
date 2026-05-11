import type { Meta, StoryObj } from "@storybook/react-vite"
import { Mail, Plus } from "lucide-react"
import { Button } from "./button"

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Button",
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add item">
        <Plus />
      </Button>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Button>
      <Mail />
      Send invite
    </Button>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Saving…",
  },
}

export const AsChild: Story = {
  render: () => (
    <Button asChild variant="outline">
      <a href="https://storybook.js.org/">Open Storybook</a>
    </Button>
  ),
}
