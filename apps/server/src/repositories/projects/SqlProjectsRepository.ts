import { Project } from "@app/shared"
import { Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { ProjectsRepository } from "./ProjectsRepository"

type SqliteInsertResult = {
  readonly lastInsertRowid: number | bigint
}

const insertedIdFrom = (result: SqliteInsertResult) =>
  Number(result.lastInsertRowid)

type ProjectRow = {
  readonly id: number
  readonly user_id: number
  readonly name: string
  readonly description: string
  readonly archived: number
}

const toProject = (row: ProjectRow) =>
  new Project({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    archived: row.archived === 1,
  })

export const SqlProjectsRepositoryLayer = Layer.effect(
  ProjectsRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const listByUser = Effect.fn("SqlProjectsRepository.listByUser")(function* (
      userId: number,
    ) {
      const rows = yield* sql<ProjectRow>`
        SELECT id, user_id, name, description, archived
        FROM projects
        WHERE user_id = ${userId}
        ORDER BY id ASC
      `.pipe(Effect.orDie)

      return rows.map(toProject)
    })

    const getByIdForUser = Effect.fn("SqlProjectsRepository.getByIdForUser")(
      function* (userId: number, id: number) {
        const rows = yield* sql<ProjectRow>`
        SELECT id, user_id, name, description, archived
        FROM projects
        WHERE user_id = ${userId} AND id = ${id}
        LIMIT 1
      `.pipe(Effect.orDie)

        const row = rows[0]
        return row === undefined ? null : toProject(row)
      },
    )

    const createForUser = Effect.fn("SqlProjectsRepository.createForUser")(
      function* (input: {
        readonly userId: number
        readonly name: string
        readonly description: string
      }) {
        const result = (yield* sql`
        INSERT INTO projects (user_id, name, description, archived)
        VALUES (${input.userId}, ${input.name}, ${input.description}, 0)
      `.raw.pipe(Effect.orDie)) as SqliteInsertResult

        return yield* getByIdForUser(input.userId, insertedIdFrom(result)).pipe(
          Effect.flatMap((project) =>
            project === null
              ? Effect.die("Inserted project not found")
              : Effect.succeed(project),
          ),
        )
      },
    )

    const updateForUser = Effect.fn("SqlProjectsRepository.updateForUser")(
      function* (input: {
        readonly userId: number
        readonly id: number
        readonly name: string
        readonly description: string
      }) {
        yield* sql`
        UPDATE projects
        SET name = ${input.name}, description = ${input.description}
        WHERE user_id = ${input.userId} AND id = ${input.id}
      `.pipe(Effect.orDie)
      },
    )

    const archiveForUser = Effect.fn("SqlProjectsRepository.archiveForUser")(
      function* (userId: number, id: number) {
        yield* sql`
        UPDATE projects
        SET archived = 1
        WHERE user_id = ${userId} AND id = ${id}
      `.pipe(Effect.orDie)
      },
    )

    return ProjectsRepository.of({
      listByUser,
      getByIdForUser,
      createForUser,
      updateForUser,
      archiveForUser,
    })
  }),
)
