import type { Meta, StoryObj } from "@storybook/react-vite"
import { Separator } from "./separator"

const meta = {
  title: "UI/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="w-[360px] space-y-3 text-sm">
      <div>
        <p className="font-medium">Launch checklist</p>
        <p className="text-muted-foreground">Prepare the public release.</p>
      </div>
      <Separator />
      <div className="text-muted-foreground">Updated just now</div>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-6 items-center gap-3 text-sm">
      <span>Overview</span>
      <Separator orientation="vertical" />
      <span>Projects</span>
      <Separator orientation="vertical" />
      <span>Todos</span>
    </div>
  ),
}
