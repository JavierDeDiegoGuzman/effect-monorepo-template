import {
  type CreateProjectInput,
  Project,
  ProjectNotFound,
  type UpdateProjectInput,
} from "@app/shared"
import { Effect, Layer, Ref, ServiceMap } from "effect"

const normalizeName = (name: string) => name.trim()
const normalizeDescription = (description: string) => description.trim()

export class Projects extends ServiceMap.Service<
  Projects,
  {
    readonly listByWorkspace: (workspaceId: number) => Effect.Effect<Array<Project>>
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
      const nextId = yield* Ref.make(3)
      const store = new Map<number, Project>([
        [
          1,
          new Project({
            id: 1,
            workspaceId: 1,
            name: "Template",
            description: "Base setup and architecture work",
            archived: false,
          }),
        ],
        [
          2,
          new Project({
            id: 2,
            workspaceId: 2,
            name: "Website",
            description: "Public web experience",
            archived: false,
          }),
        ],
      ])

      const listByWorkspace = Effect.fn("Projects.listByWorkspace")(function* (
        workspaceId: number,
      ) {
        return Array.from(store.values()).filter((project) => project.workspaceId === workspaceId)
      })

      const getByIdInWorkspace = Effect.fn("Projects.getByIdInWorkspace")(function* (
        workspaceId: number,
        id: number,
      ) {
        yield* Effect.annotateCurrentSpan({
          "workspace.id": workspaceId,
          "project.id": id,
        })

        const project = store.get(id)
        if (project === undefined || project.workspaceId !== workspaceId) {
          return yield* new ProjectNotFound({ id })
        }
        return project
      })

      const createInWorkspace = Effect.fn("Projects.createInWorkspace")(function* (
        workspaceId: number,
        input: CreateProjectInput,
      ) {
        const name = normalizeName(input.name)
        const description = normalizeDescription(input.description)

        yield* Effect.annotateCurrentSpan({
          "workspace.id": workspaceId,
          "project.name.length": name.length,
          "project.description.length": description.length,
        })

        const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
        const project = new Project({
          id,
          workspaceId,
          name,
          description,
          archived: false,
        })
        store.set(id, project)
        return project
      })

      const updateInWorkspace = Effect.fn("Projects.updateInWorkspace")(function* (
        workspaceId: number,
        id: number,
        input: UpdateProjectInput,
      ) {
        const project = yield* getByIdInWorkspace(workspaceId, id)
        const updated = new Project({
          ...project,
          name: normalizeName(input.name),
          description: normalizeDescription(input.description),
        })

        store.set(id, updated)
        return updated
      })

      const archiveInWorkspace = Effect.fn("Projects.archiveInWorkspace")(function* (
        workspaceId: number,
        id: number,
      ) {
        const project = yield* getByIdInWorkspace(workspaceId, id)
        const archived = new Project({
          ...project,
          archived: true,
        })

        store.set(id, archived)
        return archived
      })

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
