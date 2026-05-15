import { useAtomValue } from "@effect/atom-react"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import { Screen } from "@/components/patterns/Screen"
import { DashboardSummary } from "@/components/screen-parts/dashboard/DashboardSummary"
import { toErrorMessage } from "@/lib/errors"
import { currentSessionQuery } from "@/modules/auth"
import { todosQuery } from "@/modules/todos"

export function DashboardScreen() {
  const sessionState = useAtomValue(currentSessionQuery)
  const todosState = useAtomValue(todosQuery)

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

      return AsyncResult.matchWithError(todosState, {
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
                A dashboard that summarizes your current scope before you move
                into the todos collection.
              </Screen.Description>
            </Screen.Header>

            <Screen.Body>
              <Screen.Section>
                <DashboardSummary session={session} todos={todos} />
              </Screen.Section>
            </Screen.Body>
          </Screen.Root>
        ),
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
