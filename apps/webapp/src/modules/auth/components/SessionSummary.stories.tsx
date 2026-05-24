import type { Meta, StoryObj } from "@storybook/react-vite"
import { sessionFixtures } from "@/test/fixtures"
import { SessionSummary } from "./SessionSummary"

const meta = {
  title: "Domain/Auth/SessionSummary",
  component: SessionSummary,
  parameters: {
    layout: "padded",
  },
  args: {
    session: sessionFixtures.ada,
  },
} satisfies Meta<typeof SessionSummary>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongIdentity: Story = {
  args: {
    session: sessionFixtures.longIdentity,
  },
}
