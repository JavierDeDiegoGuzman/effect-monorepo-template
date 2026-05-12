import {
  type CreateProjectInput,
  type Project,
  ProjectNotFound,
  type UpdateProjectInput,
} from "@app/shared"
import { Effect, ServiceMap } from "effect"

export class Projects extends ServiceMap.Service<
  Projects,
  {
    readonly listByUser: (userId: number) => Effect.Effect<Array<Project>>
    readonly getByIdForUser: (
      userId: number,
      id: number,
    ) => Effect.Effect<Project, ProjectNotFound>
    readonly createForUser: (
      userId: number,
      input: CreateProjectInput,
    ) => Effect.Effect<Project>
    readonly updateForUser: (
      userId: number,
      id: number,
      input: UpdateProjectInput,
    ) => Effect.Effect<Project, ProjectNotFound>
    readonly archiveForUser: (
      userId: number,
      id: number,
    ) => Effect.Effect<Project, ProjectNotFound>
  }
>()("app/Projects") {}
