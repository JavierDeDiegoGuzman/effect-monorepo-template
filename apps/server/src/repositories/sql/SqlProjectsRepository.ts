import { Project } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { ProjectsRepository } from "../ProjectsRepository"

const insertedIdFrom = (result: unknown) =>
  Number(
    (result as { readonly lastInsertRowid: number | bigint }).lastInsertRowid,
  )

type ProjectRow = {
  readonly id: number
  readonly workspace_id: number
  readonly name: string
  readonly description: string
  readonly archived: number
}

const toProject = (row: ProjectRow) =>
  new Project({
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    description: row.description,
    archived: row.archived === 1,
  })

export const SqlProjectsRepositoryLayer = Layer.effect(
  ProjectsRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const listByWorkspace = Effect.fn("SqlProjectsRepository.listByWorkspace")(
      function* (workspaceId: number) {
        const rows = yield* sql<ProjectRow>`
        SELECT id, workspace_id, name, description, archived
        FROM projects
        WHERE workspace_id = ${workspaceId}
        ORDER BY id ASC
      `.pipe(Effect.orDie)

        return rows.map(toProject)
      },
    )

    const getByIdInWorkspace = Effect.fn(
      "SqlProjectsRepository.getByIdInWorkspace",
    )(function* (workspaceId: number, id: number) {
      const rows = yield* sql<ProjectRow>`
        SELECT id, workspace_id, name, description, archived
        FROM projects
        WHERE workspace_id = ${workspaceId} AND id = ${id}
        LIMIT 1
      `.pipe(Effect.orDie)

      const row = rows[0]
      return row === undefined ? null : toProject(row)
    })

    const createInWorkspace = Effect.fn(
      "SqlProjectsRepository.createInWorkspace",
    )(function* (input: {
      readonly workspaceId: number
      readonly name: string
      readonly description: string
    }) {
      const result = yield* sql`
        INSERT INTO projects (workspace_id, name, description, archived)
        VALUES (${input.workspaceId}, ${input.name}, ${input.description}, 0)
      `.raw.pipe(Effect.orDie)

      return yield* getByIdInWorkspace(
        input.workspaceId,
        insertedIdFrom(result),
      ).pipe(
        Effect.flatMap((project) =>
          project === null
            ? Effect.die("Inserted project not found")
            : Effect.succeed(project),
        ),
      )
    })

    const updateInWorkspace = Effect.fn(
      "SqlProjectsRepository.updateInWorkspace",
    )(function* (input: {
      readonly workspaceId: number
      readonly id: number
      readonly name: string
      readonly description: string
    }) {
      yield* sql`
        UPDATE projects
        SET name = ${input.name}, description = ${input.description}
        WHERE workspace_id = ${input.workspaceId} AND id = ${input.id}
      `.pipe(Effect.orDie)
    })

    const archiveInWorkspace = Effect.fn(
      "SqlProjectsRepository.archiveInWorkspace",
    )(function* (workspaceId: number, id: number) {
      yield* sql`
        UPDATE projects
        SET archived = 1
        WHERE workspace_id = ${workspaceId} AND id = ${id}
      `.pipe(Effect.orDie)
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
