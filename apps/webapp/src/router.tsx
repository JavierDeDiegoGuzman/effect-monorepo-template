import type { CurrentSession } from "@app/shared"
import {
  createHashHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Navigate,
  Outlet,
  useRouterState,
} from "@tanstack/react-router"
import { AppShell } from "@/components/patterns/app-shell/AppShell"
import { DashboardScreen } from "@/components/screens/DashboardScreen"
import { LoginScreen } from "@/components/screens/LoginScreen"
import { ProjectScreen } from "@/components/screens/ProjectScreen"
import { ProjectsScreen } from "@/components/screens/ProjectsScreen"
import { RegisterScreen } from "@/components/screens/RegisterScreen"
import { TodosScreen } from "@/components/screens/TodosScreen"
import { routeFromPath } from "@/lib/router"

type RouterContext = {
  readonly session: CurrentSession | null
}

const isPublicPath = (path: string) => path === "/login" || path === "/register"

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
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

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  component: ProjectsScreen,
})

const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId",
  component: ProjectRoute,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  todosRoute,
  projectsRoute,
  projectRoute,
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
  const route = routeFromPath(pathname)

  if (session === null && !isPublicPath(pathname)) {
    return <Navigate to="/login" replace />
  }

  if (session !== null && isPublicPath(pathname)) {
    return <Navigate to="/" replace />
  }

  return (
    <AppShell route={route} session={session}>
      <Outlet />
    </AppShell>
  )
}

function ProjectRoute() {
  const { projectId } = projectRoute.useParams()
  return <ProjectScreen projectId={Number(projectId)} />
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
