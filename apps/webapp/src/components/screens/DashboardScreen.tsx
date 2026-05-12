import { useAtomValue } from "@effect/atom-react"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import { currentSessionQuery } from "@/features/auth/atoms"
import { projectsQuery } from "@/features/projects/atoms"
import { todosQuery } from "@/features/todos/atoms"
import { DashboardSummary } from "@/features/dashboard/components/DashboardSummary"
import { Screen } from "@/components/patterns/Screen"
import { toErrorMessage } from "@/lib/errors"

export function DashboardScreen() {
  const sessionState = useAtomValue(currentSessionQuery)
  const todosState = useAtomValue(todosQuery)
  const projectsState = useAtomValue(projectsQuery)

  return AsyncResult.matchWithError(sessionState, {
    onInitial: () => <DashboardScreenLoading />,
    onError: (error) => (
      <DashboardScreenError message={toErrorMessage(error)} />
    ),
    onDefect: (defect) => (
      <DashboardScreenError message={toErrorMessage(defect)} />
    ),
    onSuccess: ({ value: session }) => {
      if (session === null) {
        return <DashboardScreenError message="No active session" />
      }

      return AsyncResult.matchWithError(projectsState, {
        onInitial: () => <DashboardScreenLoading />,
        onError: (error) => (
          <DashboardScreenError message={toErrorMessage(error)} />
        ),
        onDefect: (defect) => (
          <DashboardScreenError message={toErrorMessage(defect)} />
        ),
        onSuccess: ({ value: projects }) =>
          AsyncResult.matchWithError(todosState, {
            onInitial: () => <DashboardScreenLoading />,
            onError: (error) => (
              <DashboardScreenError message={toErrorMessage(error)} />
            ),
            onDefect: (defect) => (
              <DashboardScreenError message={toErrorMessage(defect)} />
            ),
            onSuccess: ({ value: todos }) => (
              <Screen.Root>
                <Screen.Header>
                  <Screen.Title>Dashboard</Screen.Title>
                  <Screen.Description>
                    A dashboard that summarizes your current scope before you
                    move into collection and detail screens.
                  </Screen.Description>
                </Screen.Header>

                <Screen.Body>
                  <Screen.Section>
                    <DashboardSummary
                      session={session}
                      projects={projects}
                      todos={todos}
                    />
                  </Screen.Section>
                </Screen.Body>
              </Screen.Root>
            ),
          }),
      })
    },
  })
}

function DashboardScreenLoading() {
  return (
    <Screen.Root>
      <Screen.Header>
        <Screen.Title>Dashboard</Screen.Title>
        <Screen.Description>Loading dashboard summary...</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Loading>Loading dashboard...</Screen.Loading>
      </Screen.Body>
    </Screen.Root>
  )
}

function DashboardScreenError({ message }: { readonly message: string }) {
  return (
    <Screen.Root>
      <Screen.Header>
        <Screen.Title>Dashboard</Screen.Title>
        <Screen.Description>Account summary screen.</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Error>{message}</Screen.Error>
      </Screen.Body>
    </Screen.Root>
  )
}
