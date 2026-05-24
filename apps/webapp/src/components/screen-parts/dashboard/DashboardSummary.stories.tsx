import { makeTodoId } from "@app/shared"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { sessionFixtures, todoFixtures } from "@/test/fixtures"
import { DashboardSummary } from "./DashboardSummary"

const meta = {
  title: "Screen Parts/Dashboard/DashboardSummary",
  component: DashboardSummary,
  parameters: {
    layout: "padded",
  },
  args: {
    session: sessionFixtures.ada,
    todos: [todoFixtures.open, todoFixtures.completed],
  },
} satisfies Meta<typeof DashboardSummary>

export default meta

type Story = StoryObj<typeof meta>

export const WithTodos: Story = {}

export const EmptyTodos: Story = {
  args: {
    todos: [],
  },
}

export const ManyTodos: Story = {
  args: {
    todos: [
      todoFixtures.open,
      todoFixtures.completed,
      {
        ...todoFixtures.open,
        id: makeTodoId("00000000-0000-4000-8000-000000000203"),
        title:
          "Review the longer dashboard preview title and make sure layout remains stable",
      },
      {
        ...todoFixtures.completed,
        id: makeTodoId("00000000-0000-4000-8000-000000000204"),
        title: "Ship template docs",
      },
    ],
  },
}
