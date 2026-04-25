import {
  type CreateProjectInput,
  type Project,
  ProjectNotFound,
  type UpdateProjectInput,
} from "@app/shared"
import { Effect, Layer, ServiceMap } from "effect"
import { ProjectsRepository } from "../repositories/ProjectsRepository"

const normalizeName = (name: string) => name.trim()
const normalizeDescription = (description: string) => description.trim()

export class Projects extends ServiceMap.Service<
  Projects,
  {
    readonly listByWorkspace: (
      workspaceId: number,
    ) => Effect.Effect<Array<Project>>
    readonly getByIdInWorkspace: (
      workspaceId: number,
      id: number,
    ) => Effect.Effect<Project, ProjectNotFound>
    readonly createInWorkspace: (
      workspaceId: number,
      input: CreateProjectInput,
    ) => Effect.Effect<Project>
    readonly updateInWorkspace: (
      workspaceId: number,
      id: number,
      input: UpdateProjectInput,
    ) => Effect.Effect<Project, ProjectNotFound>
    readonly archiveInWorkspace: (
      workspaceId: number,
      id: number,
    ) => Effect.Effect<Project, ProjectNotFound>
  }
>()("app/Projects") {
  static readonly layer = Layer.effect(
    Projects,
    Effect.gen(function* () {
      const projectsRepository = yield* ProjectsRepository

      const listByWorkspace = Effect.fn("Projects.listByWorkspace")(function* (
        workspaceId: number,
      ) {
        return yield* projectsRepository.listByWorkspace(workspaceId)
      })

      const getByIdInWorkspace = Effect.fn("Projects.getByIdInWorkspace")(
        function* (workspaceId: number, id: number) {
          yield* Effect.annotateCurrentSpan({
            "workspace.id": workspaceId,
            "project.id": id,
          })

          const project = yield* projectsRepository.getByIdInWorkspace(
            workspaceId,
            id,
          )
          if (project === null) {
            return yield* new ProjectNotFound({ id })
          }

          return project
        },
      )

      const createInWorkspace = Effect.fn("Projects.createInWorkspace")(
        function* (workspaceId: number, input: CreateProjectInput) {
          const name = normalizeName(input.name)
          const description = normalizeDescription(input.description)

          yield* Effect.annotateCurrentSpan({
            "workspace.id": workspaceId,
            "project.name.length": name.length,
            "project.description.length": description.length,
          })

          return yield* projectsRepository.createInWorkspace({
            workspaceId,
            name,
            description,
          })
        },
      )

      const updateInWorkspace = Effect.fn("Projects.updateInWorkspace")(
        function* (workspaceId: number, id: number, input: UpdateProjectInput) {
          yield* getByIdInWorkspace(workspaceId, id)

          yield* projectsRepository.updateInWorkspace({
            workspaceId,
            id,
            name: normalizeName(input.name),
            description: normalizeDescription(input.description),
          })

          return yield* getByIdInWorkspace(workspaceId, id)
        },
      )

      const archiveInWorkspace = Effect.fn("Projects.archiveInWorkspace")(
        function* (workspaceId: number, id: number) {
          yield* getByIdInWorkspace(workspaceId, id)
          yield* projectsRepository.archiveInWorkspace(workspaceId, id)
          return yield* getByIdInWorkspace(workspaceId, id)
        },
      )

      return Projects.of({
        listByWorkspace,
        getByIdInWorkspace,
        createInWorkspace,
        updateInWorkspace,
        archiveInWorkspace,
      })
    }),
  )
}
