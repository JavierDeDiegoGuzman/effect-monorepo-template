import type { CurrentSession } from "@app/shared"
import { useAtom } from "@effect/atom-react"
import {
  createHashHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Link,
  Navigate,
  Outlet,
  useRouterState,
} from "@tanstack/react-router"
import { AppShell } from "@/components/patterns/app-shell/AppShell"
import { Screen } from "@/components/patterns/Screen"
import { DashboardScreen } from "@/components/screens/DashboardScreen"
import { LoginScreen } from "@/components/screens/LoginScreen"
import { RegisterScreen } from "@/components/screens/RegisterScreen"
import { TodosScreen } from "@/components/screens/TodosScreen"
import { Button } from "@/components/ui/button"
import { logoutAction, SessionSummary } from "@/modules/auth"

type RouterContext = {
  readonly session: CurrentSession | null
}

const isPublicPath = (path: string) => path === "/login" || path === "/register"

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
  notFoundComponent: NotFoundScreen,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardScreen,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginScreen,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterScreen,
})

const todosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/todos",
  component: TodosScreen,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  todosRoute,
])

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  context: { session: null },
})

function RootRoute() {
  const { session } = rootRoute.useRouteContext()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [, logout] = useAtom(logoutAction, { mode: "promise" })

  if (session === null && !isPublicPath(pathname)) {
    return <Navigate to="/login" replace />
  }

  if (session !== null && isPublicPath(pathname)) {
    return <Navigate to="/" replace />
  }

  return (
    <AppShell
      session={session}
      sessionSummary={
        session === null ? undefined : <SessionSummary session={session} />
      }
      onLogout={() => {
        void logout()
      }}
    >
      <Outlet />
    </AppShell>
  )
}

function NotFoundScreen() {
  return (
    <Screen.Root>
      <Screen.Header>
        <Screen.Title>Page not found</Screen.Title>
        <Screen.Description>
          The route you opened does not exist in this app.
        </Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Actions>
          <Button asChild>
            <Link to="/">Back to dashboard</Link>
          </Button>
        </Screen.Actions>
      </Screen.Body>
    </Screen.Root>
  )
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
