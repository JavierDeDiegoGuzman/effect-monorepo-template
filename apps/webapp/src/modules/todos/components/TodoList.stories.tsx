import type { Meta, StoryObj } from "@storybook/react-vite"
import { todoFixtures } from "@/test/fixtures"
import { TodoList } from "./TodoList"

const meta = {
  title: "Domain/Todos/TodoList",
  component: TodoList,
  parameters: {
    layout: "padded",
  },
  args: {
    onToggle: () => undefined,
  },
} satisfies Meta<typeof TodoList>

export default meta

type Story = StoryObj<typeof meta>

export const Populated: Story = {
  args: {
    todos: [todoFixtures.open, todoFixtures.completed],
  },
}

export const Empty: Story = {
  args: {
    todos: [],
  },
}
