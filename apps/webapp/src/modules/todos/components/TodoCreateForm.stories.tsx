import type { Meta, StoryObj } from "@storybook/react-vite"
import { projectOptions } from "@/test/fixtures"
import { TodoCreateForm } from "./TodoCreateForm"

const meta = {
  title: "Domain/Todos/TodoCreateForm",
  component: TodoCreateForm,
  parameters: {
    layout: "padded",
  },
  args: {
    title: "",
    projectId: "none",
    projectOptions,
    pending: false,
    onTitleChange: () => undefined,
    onProjectChange: () => undefined,
    onSubmit: (event) => event.preventDefault(),
  },
} satisfies Meta<typeof TodoCreateForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSelectedProject: Story = {
  args: {
    title: "Prepare launch checklist",
    projectId: projectOptions[0]?.value ?? "none",
  },
}

export const Pending: Story = {
  args: {
    title: "Prepare launch checklist",
    projectId: projectOptions[0]?.value ?? "none",
    pending: true,
  },
}

export const ParentScoped: Story = {
  args: {
    title: "Review scoped todo UX",
    projectId: projectOptions[0]?.value ?? "none",
    titleLabel: "Project todo title",
    submitLabel: "Add project todo",
    disableProjectSelect: true,
  },
}
