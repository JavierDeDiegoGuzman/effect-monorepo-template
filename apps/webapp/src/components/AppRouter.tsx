import { useAtomValue } from "@effect/atom-react"
import { RouterProvider } from "@tanstack/react-router"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import { currentSessionQuery } from "@/atoms/auth"
import { AppShell } from "@/components/patterns/app-shell/AppShell"
import { Screen } from "@/components/patterns/Screen"
import { routeFromPath } from "@/lib/router"
import { router } from "@/router"

const currentBrowserPath = () => {
  const hashPath = window.location.hash.replace(/^#/, "")
  return hashPath.length > 0 ? hashPath : window.location.pathname
}

export function AppRouter() {
  const sessionState = useAtomValue(currentSessionQuery)

  return AsyncResult.matchWithError(sessionState, {
    onInitial: () => <SessionLoadingShell />,
    onError: () => (
      <RouterProvider router={router} context={{ session: null }} />
    ),
    onDefect: () => (
      <RouterProvider router={router} context={{ session: null }} />
    ),
    onSuccess: ({ value: session }) => (
      <RouterProvider router={router} context={{ session }} />
    ),
  })
}

function SessionLoadingShell() {
  return (
    <AppShell route={routeFromPath(currentBrowserPath())} session={null}>
      <Screen.Root>
        <Screen.Body>
          <Screen.Loading>Restoring your session...</Screen.Loading>
        </Screen.Body>
      </Screen.Root>
    </AppShell>
  )
}
