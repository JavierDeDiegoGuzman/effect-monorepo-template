import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "./button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card"

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Cards group related content and actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Use card primitives to compose forms, summaries, and focused content
          blocks.
        </p>
        <Button className="w-full">Continue</Button>
      </CardContent>
    </Card>
  ),
}

export const ContentOnly: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">
          A compact card can omit the header when the surrounding layout already
          provides the title.
        </p>
      </CardContent>
    </Card>
  ),
}
