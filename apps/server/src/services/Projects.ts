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
    readonly list: Effect.Effect<Array<Project>>
    readonly getById: (id: number) => Effect.Effect<Project, ProjectNotFound>
    readonly create: (input: CreateProjectInput) => Effect.Effect<Project>
    readonly update: (
      id: number,
      input: UpdateProjectInput,
    ) => Effect.Effect<Project, ProjectNotFound>
    readonly archive: (id: number) => Effect.Effect<Project, ProjectNotFound>
  }
>()("app/Projects") {
  static readonly layer = Layer.effect(
    Projects,
    Effect.gen(function*() {
      const nextId = yield* Ref.make(3)
      const store = new Map<number, Project>([
        [
          1,
          new Project({
            id: 1,
            name: "Template",
            description: "Base setup and architecture work",
            archived: false,
          }),
        ],
        [
          2,
          new Project({
            id: 2,
            name: "Website",
            description: "Public web experience",
            archived: false,
          }),
        ],
      ])

      const list = Effect.fn("Projects.list")(function* () {
        return Array.from(store.values())
      })()

      const getById = Effect.fn("Projects.getById")(function* (id: number) {
        yield* Effect.annotateCurrentSpan({
          "project.id": id,
        })

        const project = store.get(id)
        if (project === undefined) {
          return yield* new ProjectNotFound({ id })
        }
        return project
      })

      const create = Effect.fn("Projects.create")(function* (
        input: CreateProjectInput,
      ) {
        const name = normalizeName(input.name)
        const description = normalizeDescription(input.description)

        yield* Effect.annotateCurrentSpan({
          "project.name.length": name.length,
          "project.description.length": description.length,
        })

        const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
        const project = new Project({
          id,
          name,
          description,
          archived: false,
        })
        store.set(id, project)

        yield* Effect.annotateCurrentSpan({
          "project.id": project.id,
          "project.archived": project.archived,
        })

        return project
      })

      const update = Effect.fn("Projects.update")(function* (
        id: number,
        input: UpdateProjectInput,
      ) {
        const project = yield* getById(id)
        const updated = new Project({
          ...project,
          name: normalizeName(input.name),
          description: normalizeDescription(input.description),
        })

        yield* Effect.annotateCurrentSpan({
          "project.id": id,
          "project.name.length": updated.name.length,
          "project.description.length": updated.description.length,
        })

        store.set(id, updated)
        return updated
      })

      const archive = Effect.fn("Projects.archive")(function* (id: number) {
        const project = yield* getById(id)
        const archived = new Project({
          ...project,
          archived: true,
        })

        yield* Effect.annotateCurrentSpan({
          "project.id": id,
          "project.archived": archived.archived,
        })

        store.set(id, archived)
        return archived
      })

      return Projects.of({ list, getById, create, update, archive })
    }),
  )
}
