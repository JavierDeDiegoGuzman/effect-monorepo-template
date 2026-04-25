import type { Project } from "@app/shared"
import { type Effect, ServiceMap } from "effect"

export class ProjectsRepository extends ServiceMap.Service<
  ProjectsRepository,
  {
    readonly listByWorkspace: (
      workspaceId: number,
    ) => Effect.Effect<Array<Project>>
    readonly getByIdInWorkspace: (
      workspaceId: number,
      id: number,
    ) => Effect.Effect<Project | null>
    readonly createInWorkspace: (input: {
      readonly workspaceId: number
      readonly name: string
      readonly description: string
    }) => Effect.Effect<Project>
    readonly updateInWorkspace: (input: {
      readonly workspaceId: number
      readonly id: number
      readonly name: string
      readonly description: string
    }) => Effect.Effect<void>
    readonly archiveInWorkspace: (
      workspaceId: number,
      id: number,
    ) => Effect.Effect<void>
  }
>()("app/repositories/ProjectsRepository") {}
