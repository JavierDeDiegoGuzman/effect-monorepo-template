import type { Meta, StoryObj } from "@storybook/react-vite"
import { ProjectCreateForm } from "./ProjectCreateForm"

const meta = {
  title: "Domain/Projects/ProjectCreateForm",
  component: ProjectCreateForm,
  parameters: {
    layout: "padded",
  },
  args: {
    name: "",
    description: "",
    pending: false,
    onNameChange: () => undefined,
    onDescriptionChange: () => undefined,
    onSubmit: (event) => event.preventDefault(),
  },
} satisfies Meta<typeof ProjectCreateForm>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Filled: Story = {
  args: {
    name: "Launch checklist",
    description: "Coordinate the public launch work",
  },
}

export const Pending: Story = {
  args: {
    name: "Launch checklist",
    description: "Coordinate the public launch work",
    pending: true,
  },
}
