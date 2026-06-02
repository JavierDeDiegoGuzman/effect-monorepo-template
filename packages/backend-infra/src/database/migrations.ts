import { Effect } from "effect"
import * as Migrator from "effect/unstable/sql/Migrator"
import type * as SqlClient from "effect/unstable/sql/SqlClient"
import Migration001Initial from "./migrations/001_initial"

type MigrationEntry = readonly [
  id: number,
  name: string,
  migration: Effect.Effect<void, unknown, SqlClient.SqlClient>,
]

export const migrationEntries: ReadonlyArray<MigrationEntry> = [
  [1, "initial", Migration001Initial],
]

export const makeMigrationLoader = (throughId?: number) =>
  Migrator.fromRecord(
    Object.fromEntries(
      migrationEntries
        .filter(([id]) => throughId === undefined || id <= throughId)
        .map(([id, name, migration]) => [`${id}_${name}`, migration]),
    ),
  )

const run = Migrator.make({})

export type RunMigrationsOptions = {
  readonly toMigrationInclusive?: number | undefined
}

export const runMigrations = Effect.fn("runMigrations")(function* (
  options: RunMigrationsOptions = {},
) {
  const executed = yield* run({
    loader: makeMigrationLoader(options.toMigrationInclusive),
  })

  yield* Effect.logInfo("database migrations complete").pipe(
    Effect.annotateLogs({
      migrations: executed.map(([id, name]) => `${id}_${name}`),
    }),
  )

  return executed
})
