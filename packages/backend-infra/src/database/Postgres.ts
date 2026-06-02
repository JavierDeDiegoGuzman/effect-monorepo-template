import { PgClient } from "@effect/sql-pg"
import { Config, Context, Effect, Layer } from "effect"
import { Reactivity } from "effect/unstable/reactivity"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { runMigrations } from "./migrations"

type PostgresLayerOptions = {
  readonly migrate?: boolean
}

const make = (options: PostgresLayerOptions = {}) =>
  Effect.gen(function* () {
    const url = yield* Config.redacted("DATABASE_URL")
    const migrate = options.migrate ?? true

    const client = yield* PgClient.make({
      url,
      applicationName: "effect-template-server",
    })

    if (migrate) {
      yield* runMigrations().pipe(
        Effect.provideService(SqlClient.SqlClient, client),
      )
    }

    return Context.make(PgClient.PgClient, client).pipe(
      Context.add(SqlClient.SqlClient, client),
    )
  })

export const makePostgresLayer = (options?: PostgresLayerOptions) =>
  Layer.effectContext(make(options)).pipe(Layer.provide(Reactivity.layer))

export const PostgresLayer = makePostgresLayer()
