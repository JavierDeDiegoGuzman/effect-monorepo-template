import type { CurrentSession } from "@app/shared"
import { Badge } from "@/components/ui/badge"

export function SessionSummary({
  session,
}: {
  readonly session: CurrentSession
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 text-sm">
      <div className="truncate font-medium leading-none">
        {session.user.name}
      </div>
      <Badge variant="outline" className="max-w-40 truncate">
        {session.workspace.name}
      </Badge>
    </div>
  )
}
