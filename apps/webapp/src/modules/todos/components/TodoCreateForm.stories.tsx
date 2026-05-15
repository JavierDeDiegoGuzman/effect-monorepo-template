import type { Meta, StoryObj } from "@storybook/react-vite"
import { TodoCreateForm } from "./TodoCreateForm"

const meta = {
  title: "Domain/Todos/TodoCreateForm",
  component: TodoCreateForm,
  parameters: {
    layout: "padded",
  },
  args: {
    title: "",
    pending: false,
    onTitleChange: () => undefined,
    onSubmit: (event) => event.preventDefault(),
  },
} satisfies Meta<typeof TodoCreateForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithTitle: Story = {
  args: {
    title: "Prepare launch checklist",
  },
}

export const Pending: Story = {
  args: {
    title: "Prepare launch checklist",
    pending: true,
  },
}

export const CustomLabels: Story = {
  args: {
    title: "Review todo UX",
    titleLabel: "Task title",
    submitLabel: "Add task",
  },
}
