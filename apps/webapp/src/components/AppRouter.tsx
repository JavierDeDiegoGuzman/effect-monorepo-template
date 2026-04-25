import type { CurrentSession } from "@app/shared"
import { useAtomValue } from "@effect/atom-react"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import * as React from "react"
import { Route, Switch, useLocation } from "wouter"
import { currentSessionQuery } from "@/atoms/auth"
import { routeFromPath } from "@/lib/router"
import { AppShell } from "./patterns/app-shell/AppShell"
import { DashboardScreen } from "./screens/DashboardScreen"
import { LoginScreen } from "./screens/LoginScreen"
import { ProjectScreen } from "./screens/ProjectScreen"
import { ProjectsScreen } from "./screens/ProjectsScreen"
import { RegisterScreen } from "./screens/RegisterScreen"
import { TodosScreen } from "./screens/TodosScreen"

const isPublicPath = (path: string) => path === "/login" || path === "/register"

export function AppRouter() {
  const [location] = useLocation()
  const route = routeFromPath(location)
  const sessionState = useAtomValue(currentSessionQuery)

  return AsyncResult.matchWithError(sessionState, {
    onInitial: () => (
      <AppShell route={route} session={null}>
        <div className="rounded-lg border border-border/60 bg-card/85 p-6 text-sm text-muted-foreground shadow-2xl backdrop-blur">
          Restoring your session...
        </div>
      </AppShell>
    ),
    onError: () => (
      <AppShell route={route} session={null}>
        <LoginScreen />
      </AppShell>
    ),
    onDefect: () => (
      <AppShell route={route} session={null}>
        <LoginScreen />
      </AppShell>
    ),
    onSuccess: ({ value: session }) => <AppRoutes session={session} />,
  })
}

function AppRoutes({ session }: { readonly session: CurrentSession | null }) {
  const [location, setLocation] = useLocation()
  const route = routeFromPath(location)

  React.useEffect(() => {
    if (session === null && !isPublicPath(location)) {
      setLocation("/login")
    }

    if (session !== null && isPublicPath(location)) {
      setLocation("/")
    }
  }, [location, session, setLocation])

  return (
    <AppShell route={route} session={session}>
      <Switch>
        <Route path="/login" component={LoginScreen} />
        <Route path="/register" component={RegisterScreen} />
        {session === null ? (
          <Route component={LoginScreen} />
        ) : (
          <>
            <Route path="/" component={DashboardScreen} />
            <Route path="/todos" component={TodosScreen} />
            <Route path="/projects" component={ProjectsScreen} />
            <Route path="/projects/:projectId">
              {(params) => (
                <ProjectScreen projectId={Number(params.projectId)} />
              )}
            </Route>
            <Route component={DashboardScreen} />
          </>
        )}
      </Switch>
    </AppShell>
  )
}
