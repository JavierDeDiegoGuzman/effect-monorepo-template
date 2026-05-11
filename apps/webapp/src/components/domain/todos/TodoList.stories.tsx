import type { Meta, StoryObj } from "@storybook/react-vite"
import { projectFixtures, todoFixtures } from "@/test/fixtures"
import { renderTodoProjectMeta, TodoList } from "./TodoList"

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

export const WithProjectMeta: Story = {
  args: {
    todos: [todoFixtures.open, todoFixtures.completed],
    renderMeta: renderTodoProjectMeta(
      new Map([[projectFixtures.active.id, projectFixtures.active]]),
    ),
  },
}

export const Empty: Story = {
  args: {
    todos: [],
  },
}
