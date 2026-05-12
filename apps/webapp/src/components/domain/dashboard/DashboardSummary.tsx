import type { CurrentSession, Project, Todo } from "@app/shared"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { pathForRoute } from "@/lib/router"

export function DashboardSummary(props: {
  readonly session: CurrentSession
  readonly projects: ReadonlyArray<Project>
  readonly todos: ReadonlyArray<Todo>
}) {
  const completedTodos = props.todos.filter((todo) => todo.completed).length
  const pendingTodos = props.todos.length - completedTodos
  const activeProjects = props.projects.filter(
    (project) => !project.archived,
  ).length
  const archivedProjects = props.projects.length - activeProjects
  const recentTodos = props.todos.slice(0, 3)
  const recentProjects = props.projects.slice(0, 3)

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
        <Card className="border-border/60 bg-muted/20">
          <CardHeader>
            <CardDescription>Signed-in user</CardDescription>
            <CardTitle>{props.session.user.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>{props.session.user.email}</div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Todos" value={props.todos.length} />
          <MetricCard label="Pending" value={pendingTodos} />
          <MetricCard label="Completed" value={completedTodos} />
          <MetricCard label="Active projects" value={activeProjects} />
          <MetricCard label="Archived projects" value={archivedProjects} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr_1fr]">
        <Card className="border-border/60 bg-muted/20">
          <CardHeader>
            <CardTitle>Move from overview to execution</CardTitle>
            <CardDescription>
              Use the dashboard to orient yourself, then jump into the project
              and todo collections where the real CRUD work happens.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to={pathForRoute({ name: "todos" })}>Open todos</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={pathForRoute({ name: "projects" })}>
                  Open projects
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <PreviewCard
          title="Recent todos"
          description="A small preview instead of the full collection."
          items={
            recentTodos.length > 0
              ? recentTodos.map(
                  (todo) => `${todo.completed ? "[x]" : "[ ]"} ${todo.title}`,
                )
              : ["No todos yet"]
          }
        />

        <PreviewCard
          title="Recent projects"
          description="Full details live in their dedicated screens."
          items={
            recentProjects.length > 0
              ? recentProjects.map(
                  (project) =>
                    `${project.archived ? "[A]" : "[ ]"} ${project.name}`,
                )
              : ["No projects yet"]
          }
        />
      </div>
    </>
  )
}

function MetricCard({
  label,
  value,
}: {
  readonly label: string
  readonly value: number
}) {
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
            <li
              key={item}
              className="rounded-lg border border-border/60 bg-background/70 px-3 py-2"
            >
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
