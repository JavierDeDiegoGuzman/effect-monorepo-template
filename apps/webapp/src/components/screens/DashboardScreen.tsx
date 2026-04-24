import { useAtomValue } from "@effect/atom-react"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import { Link } from "wouter"
import { currentSessionQuery } from "@/atoms/auth"
import { projectsQuery } from "@/atoms/projects"
import { todosQuery } from "@/atoms/todos"
import { Screen } from "@/components/patterns/Screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toErrorMessage } from "@/lib/errors"
import { pathForRoute } from "@/lib/router"

export function DashboardScreen() {
  const sessionState = useAtomValue(currentSessionQuery)
  const todosState = useAtomValue(todosQuery)
  const projectsState = useAtomValue(projectsQuery)

  return AsyncResult.matchWithError(sessionState, {
    onInitial: () => <DashboardScreenLoading />,
    onError: (error) => <DashboardScreenError message={toErrorMessage(error)} />,
    onDefect: (defect) => <DashboardScreenError message={toErrorMessage(defect)} />,
    onSuccess: ({ value: session }) => {
      if (session === null) {
        return <DashboardScreenError message="No active session" />
      }

      return AsyncResult.matchWithError(projectsState, {
        onInitial: () => <DashboardScreenLoading />,
        onError: (error) => <DashboardScreenError message={toErrorMessage(error)} />,
        onDefect: (defect) => <DashboardScreenError message={toErrorMessage(defect)} />,
        onSuccess: ({ value: projects }) =>
          AsyncResult.matchWithError(todosState, {
            onInitial: () => <DashboardScreenLoading />,
            onError: (error) => <DashboardScreenError message={toErrorMessage(error)} />,
            onDefect: (defect) => <DashboardScreenError message={toErrorMessage(defect)} />,
            onSuccess: ({ value: todos }) => {
              const completedTodos = todos.filter((todo) => todo.completed).length
              const pendingTodos = todos.length - completedTodos
              const activeProjects = projects.filter((project) => !project.archived).length
              const archivedProjects = projects.length - activeProjects
              const recentTodos = todos.slice(0, 3)
              const recentProjects = projects.slice(0, 3)

              return (
                <Screen.Root>
                  <Screen.Header>
                    <Screen.Title>Dashboard</Screen.Title>
                    <Screen.Description>
                      A workspace dashboard that summarizes your current scope before you move into collection and detail screens.
                    </Screen.Description>
                  </Screen.Header>

                  <Screen.Body>
                    <Screen.Section>
                      <div className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
                        <Card className="border-border/60 bg-muted/20">
                          <CardHeader>
                            <CardDescription>Current workspace</CardDescription>
                            <CardTitle>{session.workspace.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <div>Signed in as {session.user.name}</div>
                            <div>{session.user.email}</div>
                          </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <MetricCard label="Todos" value={todos.length} />
                          <MetricCard label="Pending" value={pendingTodos} />
                          <MetricCard label="Completed" value={completedTodos} />
                          <MetricCard label="Active projects" value={activeProjects} />
                          <MetricCard label="Archived projects" value={archivedProjects} />
                        </div>
                      </div>
                    </Screen.Section>

                    <Screen.Section>
                      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr_1fr]">
                        <Card className="border-border/60 bg-muted/20">
                          <CardHeader>
                            <CardTitle>Move from overview to execution</CardTitle>
                            <CardDescription>
                              Use the dashboard to orient yourself, then jump into the workspace collections where the real CRUD work happens.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <div className="flex flex-wrap gap-2">
                              <Button asChild variant="outline">
                                <Link href={pathForRoute({ name: "todos" })}>Open todos</Link>
                              </Button>
                              <Button asChild variant="outline">
                                <Link href={pathForRoute({ name: "projects" })}>Open projects</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <PreviewCard
                          title="Recent todos"
                          description="A small preview instead of the full collection."
                          items={
                            recentTodos.length > 0
                              ? recentTodos.map((todo) =>
                                  `${todo.completed ? "[x]" : "[ ]"} ${todo.title}`,
                                )
                              : ["No todos yet"]
                          }
                        />

                        <PreviewCard
                          title="Recent projects"
                          description="Full details live in their dedicated screens."
                          items={
                            recentProjects.length > 0
                              ? recentProjects.map((project) =>
                                  `${project.archived ? "[A]" : "[ ]"} ${project.name}`,
                                )
                              : ["No projects yet"]
                          }
                        />
                      </div>
                    </Screen.Section>
                  </Screen.Body>
                </Screen.Root>
              )
            },
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
        <Screen.Description>Workspace summary screen.</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Error>{message}</Screen.Error>
      </Screen.Body>
    </Screen.Root>
  )
}

function MetricCard({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <Card className="border-border/60 bg-muted/20">
      <CardHeader className="pb-3">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function PreviewCard(props: {
  readonly title: string
  readonly description: string
  readonly items: ReadonlyArray<string>
}) {
  return (
    <Card className="border-border/60 bg-muted/20">
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 text-sm text-muted-foreground">
          {props.items.map((item) => (
            <li key={item} className="rounded-lg border border-border/60 bg-background/70 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
