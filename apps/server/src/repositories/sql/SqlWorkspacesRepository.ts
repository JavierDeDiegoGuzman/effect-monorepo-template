import { Workspace, WorkspaceMember } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { WorkspacesRepository } from "../WorkspacesRepository"

const insertedIdFrom = (result: unknown) =>
  Number(
    (result as { readonly lastInsertRowid: number | bigint }).lastInsertRowid,
  )

type WorkspaceRow = {
  readonly id: number
  readonly name: string
  readonly kind: "personal"
}

type WorkspaceMembershipRow = {
  readonly workspace_id: number
  readonly user_id: number
  readonly role: "owner"
}

const toWorkspace = (row: WorkspaceRow) =>
  new Workspace({
    id: row.id,
    name: row.name,
    kind: row.kind,
  })

const toWorkspaceMember = (row: WorkspaceMembershipRow) =>
  new WorkspaceMember({
    workspaceId: row.workspace_id,
    userId: row.user_id,
    role: row.role,
  })

export const SqlWorkspacesRepositoryLayer = Layer.effect(
  WorkspacesRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const getCurrentForUser = Effect.fn(
      "SqlWorkspacesRepository.getCurrentForUser",
    )(function* (userId: number) {
      const rows = yield* sql<WorkspaceRow>`
        SELECT w.id, w.name, w.kind
        FROM workspaces w
        INNER JOIN workspace_members wm ON wm.workspace_id = w.id
        WHERE wm.user_id = ${userId}
        LIMIT 1
      `.pipe(Effect.orDie)

      const row = rows[0]
      return row === undefined ? null : toWorkspace(row)
    })

    const getMembershipForUser = Effect.fn(
      "SqlWorkspacesRepository.getMembershipForUser",
    )(function* (userId: number) {
      const rows = yield* sql<WorkspaceMembershipRow>`
        SELECT workspace_id, user_id, role
        FROM workspace_members
        WHERE user_id = ${userId}
        LIMIT 1
      `.pipe(Effect.orDie)

      const row = rows[0]
      return row === undefined ? null : toWorkspaceMember(row)
    })

    const create = Effect.fn("SqlWorkspacesRepository.create")(
      function* (input: { readonly name: string; readonly kind: "personal" }) {
        const result = yield* sql`
        INSERT INTO workspaces (name, kind)
        VALUES (${input.name}, ${input.kind})
      `.raw.pipe(Effect.orDie)

        const rows = yield* sql<WorkspaceRow>`
        SELECT id, name, kind
        FROM workspaces
        WHERE id = ${insertedIdFrom(result)}
        LIMIT 1
      `.pipe(Effect.orDie)

        const row = rows[0]
        if (row === undefined) {
          return yield* Effect.die("Inserted workspace not found")
        }
        return toWorkspace(row)
      },
    )

    const createMembership = Effect.fn(
      "SqlWorkspacesRepository.createMembership",
    )(function* (input: {
      readonly workspaceId: number
      readonly userId: number
      readonly role: "owner"
    }) {
      yield* sql`
        INSERT INTO workspace_members (workspace_id, user_id, role)
        VALUES (${input.workspaceId}, ${input.userId}, ${input.role})
      `.pipe(Effect.orDie)

      return new WorkspaceMember(input)
    })

    return WorkspacesRepository.of({
      getCurrentForUser,
      getMembershipForUser,
      create,
      createMembership,
    })
  }),
)
