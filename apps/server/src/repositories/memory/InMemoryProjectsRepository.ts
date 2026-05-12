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

      const listByUser = Effect.fn("InMemoryProjectsRepository.listByUser")(
        function* (userId: number) {
          return Array.from((yield* Ref.get(store)).values()).filter(
            (project) => project.userId === userId,
          )
        },
      )

      const getByIdForUser = Effect.fn(
        "InMemoryProjectsRepository.getByIdForUser",
      )(function* (userId: number, id: number) {
        const project = (yield* Ref.get(store)).get(id)
        return project !== undefined && project.userId === userId
          ? project
          : null
      })

      const createForUser = Effect.fn(
        "InMemoryProjectsRepository.createForUser",
      )(function* (input: {
        readonly userId: number
        readonly name: string
        readonly description: string
      }) {
        const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
        const project = new Project({
          id,
          userId: input.userId,
          name: input.name,
          description: input.description,
          archived: false,
        })
        yield* Ref.update(store, (current) => new Map(current).set(id, project))
        return project
      })

      const updateForUser = Effect.fn(
        "InMemoryProjectsRepository.updateForUser",
      )(function* (input: {
        readonly userId: number
        readonly id: number
        readonly name: string
        readonly description: string
      }) {
        yield* Ref.update(store, (current) => {
          const project = current.get(input.id)
          if (project === undefined || project.userId !== input.userId) {
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

      const archiveForUser = Effect.fn(
        "InMemoryProjectsRepository.archiveForUser",
      )(function* (userId: number, id: number) {
        yield* Ref.update(store, (current) => {
          const project = current.get(id)
          if (project === undefined || project.userId !== userId) {
            return current
          }
          return new Map(current).set(
            id,
            new Project({ ...project, archived: true }),
          )
        })
      })

      return ProjectsRepository.of({
        listByUser,
        getByIdForUser,
        createForUser,
        updateForUser,
        archiveForUser,
      })
    }),
  )

export const InMemoryProjectsRepositoryLayer =
  makeInMemoryProjectsRepositoryLayer()
