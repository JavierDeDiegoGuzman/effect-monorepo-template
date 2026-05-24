import type { CurrentSession } from "@app/shared"
import { useAtomValue } from "@effect/atom-react"
import { RouterProvider } from "@tanstack/react-router"
import { useEffect } from "react"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import { AppShell } from "@/components/patterns/app-shell/AppShell"
import { Screen } from "@/components/patterns/Screen"
import { currentSessionQuery } from "@/modules/auth"
import { router } from "@/router"

export function AppRouter() {
  const sessionState = useAtomValue(currentSessionQuery)

  return AsyncResult.matchWithError(sessionState, {
    onInitial: () => <SessionLoadingShell />,
    onError: () => <SessionRouterProvider session={null} />,
    onDefect: () => <SessionRouterProvider session={null} />,
    onSuccess: ({ value: session }) => (
      <SessionRouterProvider session={session} />
    ),
  })
}

function SessionRouterProvider({
  session,
}: {
  readonly session: CurrentSession | null
}) {
  const sessionKey = session?.user.id ?? "anonymous"

  useEffect(() => {
    void router.invalidate()
  }, [sessionKey])

  return <RouterProvider router={router} context={{ session }} />
}

function SessionLoadingShell() {
  return (
    <AppShell session={null}>
      <Screen.Root>
        <Screen.Body>
          <Screen.Loading>Restoring your session...</Screen.Loading>
        </Screen.Body>
      </Screen.Root>
    </AppShell>
  )
}
