import { type User, Workspace, WorkspaceMember } from "@app/shared"
import { Effect, Layer, Ref, ServiceMap } from "effect"

export class Workspaces extends ServiceMap.Service<
  Workspaces,
  {
    readonly getCurrentForUser: (userId: number) => Effect.Effect<Workspace>
    readonly createPersonalForUser: (user: User) => Effect.Effect<Workspace>
  }
>()("app/Workspaces") {
  static readonly layer = Layer.effect(
    Workspaces,
    Effect.gen(function* () {
      const nextId = yield* Ref.make(3)
      const workspaces = new Map<number, Workspace>([
        [1, new Workspace({ id: 1, name: "Alice Personal", kind: "personal" })],
        [2, new Workspace({ id: 2, name: "Bob Personal", kind: "personal" })],
      ])
      const memberships = new Map<number, WorkspaceMember>([
        [1, new WorkspaceMember({ workspaceId: 1, userId: 1, role: "owner" })],
        [2, new WorkspaceMember({ workspaceId: 2, userId: 2, role: "owner" })],
      ])

      const getCurrentForUser = Effect.fn("Workspaces.getCurrentForUser")(function* (userId: number) {
        const membership = memberships.get(userId)
        if (membership === undefined) {
          return yield* Effect.die(`Missing workspace membership for user ${userId}`)
        }

        const workspace = workspaces.get(membership.workspaceId)
        if (workspace === undefined) {
          return yield* Effect.die(`Missing workspace ${membership.workspaceId}`)
        }

        return workspace
      })

      const createPersonalForUser = Effect.fn("Workspaces.createPersonalForUser")(function* (user: User) {
        const existingMembership = memberships.get(user.id)
        if (existingMembership !== undefined) {
          return yield* getCurrentForUser(user.id)
        }

        const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
        const workspace = new Workspace({
          id,
          name: `${user.name} Personal`,
          kind: "personal",
        })
        workspaces.set(id, workspace)
        memberships.set(
          user.id,
          new WorkspaceMember({
            workspaceId: id,
            userId: user.id,
            role: "owner",
          }),
        )
        return workspace
      })

      return Workspaces.of({
        getCurrentForUser,
        createPersonalForUser,
      })
    }),
  )
}
