import { Route, Switch, useLocation } from "wouter"
import { AppShell } from "./patterns/app-shell/AppShell"
import { DashboardScreen } from "./screens/DashboardScreen"
import { ProjectScreen } from "./screens/ProjectScreen"
import { ProjectsScreen } from "./screens/ProjectsScreen"
import { TodosScreen } from "./screens/TodosScreen"
import { routeFromPath } from "../lib/router"

export function AppRouter() {
  const [location] = useLocation()
  const route = routeFromPath(location)

  return (
    <AppShell route={route}>
      <Switch>
        <Route path="/" component={DashboardScreen} />
        <Route path="/todos" component={TodosScreen} />
        <Route path="/projects" component={ProjectsScreen} />
        <Route path="/projects/:projectId">
          {(params) => <ProjectScreen projectId={Number(params.projectId)} />}
        </Route>
        <Route component={DashboardScreen} />
      </Switch>
    </AppShell>
  )
}
