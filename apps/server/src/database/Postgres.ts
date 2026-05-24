import { PgClient } from "@effect/sql-pg"
import { Config, Context, Effect, Layer } from "effect"
import { Reactivity } from "effect/unstable/reactivity"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { runMigrations } from "./migrations"

const make = Effect.gen(function* () {
  const url = yield* Config.redacted("DATABASE_URL")

  const client = yield* PgClient.make({
    url,
    applicationName: "effect-template-server",
  })

  yield* runMigrations().pipe(
    Effect.provideService(SqlClient.SqlClient, client),
  )

  return Context.make(PgClient.PgClient, client).pipe(
    Context.add(SqlClient.SqlClient, client),
  )
})

export const PostgresLayer = Layer.effectContext(make).pipe(
  Layer.provide(Reactivity.layer),
)
