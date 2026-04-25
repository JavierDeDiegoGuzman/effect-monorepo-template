import { Project } from "@app/shared"
import { Effect, Layer, Ref } from "effect"
import { ProjectsRepository } from "../ProjectsRepository"

export const makeInMemoryProjectsRepositoryLayer = (
  initialProjects: ReadonlyArray<Project> = [],
) =>
  Layer.effect(
    ProjectsRepository,
    Effect.gen(function* () {
      const nextId = yield* Ref.make(
        initialProjects.reduce((max, project) => Math.max(max, project.id), 0) +
          1,
      )
      const store = yield* Ref.make(
        new Map(initialProjects.map((project) => [project.id, project])),
      )

      const listByWorkspace = Effect.fn(
        "InMemoryProjectsRepository.listByWorkspace",
      )(function* (workspaceId: number) {
        return Array.from((yield* Ref.get(store)).values()).filter(
          (project) => project.workspaceId === workspaceId,
        )
      })

      const getByIdInWorkspace = Effect.fn(
        "InMemoryProjectsRepository.getByIdInWorkspace",
      )(function* (workspaceId: number, id: number) {
        const project = (yield* Ref.get(store)).get(id)
        return project !== undefined && project.workspaceId === workspaceId
          ? project
          : null
      })

      const createInWorkspace = Effect.fn(
        "InMemoryProjectsRepository.createInWorkspace",
      )(function* (input: {
        readonly workspaceId: number
        readonly name: string
        readonly description: string
      }) {
        const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
        const project = new Project({
          id,
          workspaceId: input.workspaceId,
          name: input.name,
          description: input.description,
          archived: false,
        })
        yield* Ref.update(store, (current) => new Map(current).set(id, project))
        return project
      })

      const updateInWorkspace = Effect.fn(
        "InMemoryProjectsRepository.updateInWorkspace",
      )(function* (input: {
        readonly workspaceId: number
        readonly id: number
        readonly name: string
        readonly description: string
      }) {
        yield* Ref.update(store, (current) => {
          const project = current.get(input.id)
          if (
            project === undefined ||
            project.workspaceId !== input.workspaceId
          ) {
            return current
          }
          return new Map(current).set(
            input.id,
            new Project({
              ...project,
              name: input.name,
              description: input.description,
            }),
          )
        })
      })

      const archiveInWorkspace = Effect.fn(
        "InMemoryProjectsRepository.archiveInWorkspace",
      )(function* (workspaceId: number, id: number) {
        yield* Ref.update(store, (current) => {
          const project = current.get(id)
          if (project === undefined || project.workspaceId !== workspaceId) {
            return current
          }
          return new Map(current).set(
            id,
            new Project({ ...project, archived: true }),
          )
        })
      })

      return ProjectsRepository.of({
        listByWorkspace,
        getByIdInWorkspace,
        createInWorkspace,
        updateInWorkspace,
        archiveInWorkspace,
      })
    }),
  )

export const InMemoryProjectsRepositoryLayer =
  makeInMemoryProjectsRepositoryLayer()
