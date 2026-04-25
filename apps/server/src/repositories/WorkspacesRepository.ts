import type { Workspace, WorkspaceMember } from "@app/shared"
import { type Effect, ServiceMap } from "effect"

export class WorkspacesRepository extends ServiceMap.Service<
  WorkspacesRepository,
  {
    readonly getCurrentForUser: (
      userId: number,
    ) => Effect.Effect<Workspace | null>
    readonly getMembershipForUser: (
      userId: number,
    ) => Effect.Effect<WorkspaceMember | null>
    readonly create: (input: {
      readonly name: string
      readonly kind: "personal"
    }) => Effect.Effect<Workspace>
    readonly createMembership: (input: {
      readonly workspaceId: number
      readonly userId: number
      readonly role: "owner"
    }) => Effect.Effect<WorkspaceMember>
  }
>()("app/repositories/WorkspacesRepository") {}
