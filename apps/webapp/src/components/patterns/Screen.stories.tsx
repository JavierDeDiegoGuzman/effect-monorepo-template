import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "@/components/ui/button"
import { Screen } from "./Screen"

const meta = {
  title: "Patterns/Screen",
  component: Screen.Root,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Screen.Root>

export default meta

type Story = StoryObj<typeof meta>

export const CollectionScreen: Story = {
  render: () => (
    <Screen.Root className="max-w-3xl">
      <Screen.Header>
        <Screen.Title>Todos</Screen.Title>
        <Screen.Description>Manage your work items.</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Section>
          <Screen.SectionHeader>
            <Screen.SectionTitle>Create todo</Screen.SectionTitle>
            <Screen.SectionDescription>
              Use sections to keep forms, actions, and lists visually grouped.
            </Screen.SectionDescription>
          </Screen.SectionHeader>
          <Screen.Actions>
            <Button>Add todo</Button>
            <Button variant="outline">Import</Button>
          </Screen.Actions>
        </Screen.Section>
        <Screen.SectionDivider />
        <Screen.Stats>
          <Screen.Stat>
            <Screen.StatLabel>Total</Screen.StatLabel>
            <Screen.StatValue>12</Screen.StatValue>
          </Screen.Stat>
          <Screen.Stat>
            <Screen.StatLabel>Open</Screen.StatLabel>
            <Screen.StatValue>7</Screen.StatValue>
          </Screen.Stat>
          <Screen.Stat>
            <Screen.StatLabel>Completed</Screen.StatLabel>
            <Screen.StatValue>5</Screen.StatValue>
          </Screen.Stat>
        </Screen.Stats>
      </Screen.Body>
    </Screen.Root>
  ),
}

export const LoadingState: Story = {
  render: () => (
    <Screen.Root className="max-w-3xl">
      <Screen.Header>
        <Screen.Title>Todos</Screen.Title>
        <Screen.Description>Loading the todo collection.</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Loading>Loading todos…</Screen.Loading>
      </Screen.Body>
    </Screen.Root>
  ),
}

export const EmptyState: Story = {
  render: () => (
    <Screen.Root className="max-w-3xl">
      <Screen.Header>
        <Screen.Title>Todos</Screen.Title>
        <Screen.Description>No todos have been created yet.</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Empty>Create a todo to start tracking your work.</Screen.Empty>
      </Screen.Body>
    </Screen.Root>
  ),
}

export const ErrorState: Story = {
  render: () => (
    <Screen.Root className="max-w-3xl">
      <Screen.Header>
        <Screen.Title>Todos</Screen.Title>
        <Screen.Description>The API returned an error.</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Error>Unable to load todos. Try again.</Screen.Error>
      </Screen.Body>
    </Screen.Root>
  ),
}
