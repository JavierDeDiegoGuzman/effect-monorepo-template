import { Link } from "@tanstack/react-router"
import { Screen } from "@/components/patterns/Screen"
import { Button } from "@/components/ui/button"
import { pathForRoute } from "@/lib/router"

export function ProjectNotFound() {
  return (
    <Screen.Root>
      <Screen.Header>
        <Screen.Title>Project not found</Screen.Title>
        <Screen.Description>
          The requested project does not exist in your account.
        </Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Empty>
          <div className="flex flex-wrap items-center gap-3">
            <span>
              Go back to the projects collection to pick another project.
            </span>
            <Button asChild variant="outline">
              <Link to={pathForRoute({ name: "projects" })}>
                Back to projects
              </Link>
            </Button>
          </div>
        </Screen.Empty>
      </Screen.Body>
    </Screen.Root>
  )
}
