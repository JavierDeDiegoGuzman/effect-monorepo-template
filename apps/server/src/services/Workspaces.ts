import type { User, Workspace } from "@app/shared"
import { Effect, Layer, ServiceMap } from "effect"
import { Transactions } from "../repositories/Transactions"
import { WorkspacesRepository } from "../repositories/WorkspacesRepository"

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
      const transactions = yield* Transactions
      const workspacesRepository = yield* WorkspacesRepository

      const getCurrentForUser = Effect.fn("Workspaces.getCurrentForUser")(
        function* (userId: number) {
          const workspace =
            yield* workspacesRepository.getCurrentForUser(userId)
          if (workspace === null) {
            return yield* Effect.die(
              `Missing workspace membership for user ${userId}`,
            )
          }

          return workspace
        },
      )

      const createPersonalForUser = Effect.fn(
        "Workspaces.createPersonalForUser",
      )(function* (user: User) {
        const existingMembership =
          yield* workspacesRepository.getMembershipForUser(user.id)
        if (existingMembership !== null) {
          return yield* getCurrentForUser(user.id)
        }

        return yield* Effect.gen(function* () {
          const workspace = yield* workspacesRepository.create({
            name: `${user.name} Personal`,
            kind: "personal",
          })

          yield* workspacesRepository.createMembership({
            workspaceId: workspace.id,
            userId: user.id,
            role: "owner",
          })

          return workspace
        }).pipe(transactions.withTransaction)
      })

      return Workspaces.of({
        getCurrentForUser,
        createPersonalForUser,
      })
    }),
  )
}
