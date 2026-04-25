import { Workspace, WorkspaceMember } from "@app/shared"
import { Effect, Layer, Ref } from "effect"
import { WorkspacesRepository } from "../WorkspacesRepository"

export const makeInMemoryWorkspacesRepositoryLayer = (options?: {
  readonly workspaces?: ReadonlyArray<Workspace>
  readonly memberships?: ReadonlyArray<WorkspaceMember>
}) =>
  Layer.effect(
    WorkspacesRepository,
    Effect.gen(function* () {
      const initialWorkspaces = options?.workspaces ?? []
      const initialMemberships = options?.memberships ?? []
      const nextId = yield* Ref.make(
        initialWorkspaces.reduce(
          (max, workspace) => Math.max(max, workspace.id),
          0,
        ) + 1,
      )
      const workspaces = yield* Ref.make(
        new Map(
          initialWorkspaces.map((workspace) => [workspace.id, workspace]),
        ),
      )
      const memberships = yield* Ref.make(
        new Map(
          initialMemberships.map((membership) => [
            membership.userId,
            membership,
          ]),
        ),
      )

      const getCurrentForUser = Effect.fn(
        "InMemoryWorkspacesRepository.getCurrentForUser",
      )(function* (userId: number) {
        const membership = (yield* Ref.get(memberships)).get(userId)
        if (membership === undefined) {
          return null
        }
        return (yield* Ref.get(workspaces)).get(membership.workspaceId) ?? null
      })

      const getMembershipForUser = Effect.fn(
        "InMemoryWorkspacesRepository.getMembershipForUser",
      )(function* (userId: number) {
        return (yield* Ref.get(memberships)).get(userId) ?? null
      })

      const create = Effect.fn("InMemoryWorkspacesRepository.create")(
        function* (input: {
          readonly name: string
          readonly kind: "personal"
        }) {
          const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
          const workspace = new Workspace({
            id,
            name: input.name,
            kind: input.kind,
          })
          yield* Ref.update(workspaces, (current) =>
            new Map(current).set(id, workspace),
          )
          return workspace
        },
      )

      const createMembership = Effect.fn(
        "InMemoryWorkspacesRepository.createMembership",
      )(function* (input: {
        readonly workspaceId: number
        readonly userId: number
        readonly role: "owner"
      }) {
        const membership = new WorkspaceMember(input)
        yield* Ref.update(memberships, (current) =>
          new Map(current).set(input.userId, membership),
        )
        return membership
      })

      return WorkspacesRepository.of({
        getCurrentForUser,
        getMembershipForUser,
        create,
        createMembership,
      })
    }),
  )

export const InMemoryWorkspacesRepositoryLayer =
  makeInMemoryWorkspacesRepositoryLayer()
