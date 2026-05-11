import type { Project } from "@app/shared"
import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { pathForRoute } from "@/lib/router"

export function ProjectList(props: {
  readonly projects: ReadonlyArray<Project>
  readonly pending: boolean
  readonly onArchive: (project: Project) => void
}) {
  return (
    <ul className="grid gap-3">
      {props.projects.map((project) => (
        <ProjectListItem
          key={project.id}
          project={project}
          pending={props.pending}
          onArchive={props.onArchive}
        />
      ))}
    </ul>
  )
}

function ProjectListItem(props: {
  readonly project: Project
  readonly pending: boolean
  readonly onArchive: (project: Project) => void
}) {
  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background/70 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{props.project.name}</span>
          {props.project.archived ? (
            <Badge variant="outline">Archived</Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {props.project.description.length > 0
            ? props.project.description
            : "No description"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link
            to={pathForRoute({
              name: "project",
              projectId: props.project.id,
            })}
          >
            View details
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => props.onArchive(props.project)}
          disabled={props.pending || props.project.archived}
        >
          Archive
        </Button>
      </div>
    </li>
  )
}
