import { Effect } from "effect"
import { RepositoryError } from "../errors/repository"

export const makeRepositoryError =
  (repository: string) => (operation: string) =>
    new RepositoryError({ repository, operation })

export const mapRepositoryError = (repository: string, operation: string) =>
  Effect.mapError(() => new RepositoryError({ repository, operation }))

export const oneOrNull = <A, B>(
  rows: ReadonlyArray<A>,
  mapRow: (row: A) => B,
): B | null => {
  const row = rows[0]
  return row === undefined ? null : mapRow(row)
}

export const firstColumnOrNull = <A, K extends keyof A>(
  rows: ReadonlyArray<A>,
  key: K,
): A[K] | null => rows[0]?.[key] ?? null

export const requireReadBack = <A, E>(
  value: A | null,
  error: E,
): Effect.Effect<A, E> =>
  value === null ? Effect.fail(error) : Effect.succeed(value)
