import type { Project } from "@app/shared"
import { type Effect, ServiceMap } from "effect"

export class ProjectsRepository extends ServiceMap.Service<
  ProjectsRepository,
  {
    readonly listByUser: (userId: number) => Effect.Effect<Array<Project>>
    readonly getByIdForUser: (
      userId: number,
      id: number,
    ) => Effect.Effect<Project | null>
    readonly createForUser: (input: {
      readonly userId: number
      readonly name: string
      readonly description: string
    }) => Effect.Effect<Project>
    readonly updateForUser: (input: {
      readonly userId: number
      readonly id: number
      readonly name: string
      readonly description: string
    }) => Effect.Effect<void>
    readonly archiveForUser: (userId: number, id: number) => Effect.Effect<void>
  }
>()("app/modules/projects/ProjectsRepository") {}
