import { Link } from "@tanstack/react-router"
import { Screen } from "@/components/patterns/Screen"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { pathForRoute } from "@/lib/router"

export function ProjectSummary(props: {
  readonly name: string
  readonly description: string
  readonly archived: boolean
  readonly todoCount: number
  readonly completedCount: number
}) {
  return (
    <Screen.Header>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={pathForRoute({ name: "projects" })}>Projects</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{props.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Screen.Title>{props.name}</Screen.Title>
            {props.archived ? <Badge variant="outline">Archived</Badge> : null}
          </div>
          <Screen.Description>
            {props.description.length > 0
              ? props.description
              : "No description"}
          </Screen.Description>
        </div>

        <Screen.Stats>
          <Screen.Stat>
            <Screen.StatLabel>Status</Screen.StatLabel>
            <Screen.StatValue>
              {props.archived ? "Archived" : "Active"}
            </Screen.StatValue>
          </Screen.Stat>
          <Screen.Stat>
            <Screen.StatLabel>Todos</Screen.StatLabel>
            <Screen.StatValue>{props.todoCount}</Screen.StatValue>
          </Screen.Stat>
          <Screen.Stat>
            <Screen.StatLabel>Completed</Screen.StatLabel>
            <Screen.StatValue>{props.completedCount}</Screen.StatValue>
          </Screen.Stat>
        </Screen.Stats>
      </div>
    </Screen.Header>
  )
}
