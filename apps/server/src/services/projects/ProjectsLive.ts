import {
  type CreateProjectInput,
  ProjectNotFound,
  type UpdateProjectInput,
} from "@app/shared"
import { Effect, Layer } from "effect"
import { ProjectsRepository } from "../../repositories/ProjectsRepository"
import { Projects } from "./Projects"

const normalizeName = (name: string) => name.trim()
const normalizeDescription = (description: string) => description.trim()

export const ProjectsLive = Layer.effect(
  Projects,
  Effect.gen(function* () {
    const projectsRepository = yield* ProjectsRepository

    const listByUser = Effect.fn("Projects.listByUser")(function* (
      userId: number,
    ) {
      return yield* projectsRepository.listByUser(userId)
    })

    const getByIdForUser = Effect.fn("Projects.getByIdForUser")(function* (
      userId: number,
      id: number,
    ) {
      yield* Effect.annotateCurrentSpan({
        "user.id": userId,
        "project.id": id,
      })

      const project = yield* projectsRepository.getByIdForUser(userId, id)
      if (project === null) {
        return yield* new ProjectNotFound({ id })
      }

      return project
    })

    const createForUser = Effect.fn("Projects.createForUser")(function* (
      userId: number,
      input: CreateProjectInput,
    ) {
      const name = normalizeName(input.name)
      const description = normalizeDescription(input.description)

      yield* Effect.annotateCurrentSpan({
        "user.id": userId,
        "project.name.length": name.length,
        "project.description.length": description.length,
      })

      return yield* projectsRepository.createForUser({
        userId,
        name,
        description,
      })
    })

    const updateForUser = Effect.fn("Projects.updateForUser")(function* (
      userId: number,
      id: number,
      input: UpdateProjectInput,
    ) {
      yield* getByIdForUser(userId, id)

      yield* projectsRepository.updateForUser({
        userId,
        id,
        name: normalizeName(input.name),
        description: normalizeDescription(input.description),
      })

      return yield* getByIdForUser(userId, id)
    })

    const archiveForUser = Effect.fn("Projects.archiveForUser")(function* (
      userId: number,
      id: number,
    ) {
      yield* getByIdForUser(userId, id)
      yield* projectsRepository.archiveForUser(userId, id)
      return yield* getByIdForUser(userId, id)
    })

    return Projects.of({
      listByUser,
      getByIdForUser,
      createForUser,
      updateForUser,
      archiveForUser,
    })
  }),
)
