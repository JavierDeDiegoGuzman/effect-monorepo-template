import { rm } from "node:fs/promises"
import { dirname } from "node:path"
import { NodeRuntime } from "@effect/platform-node"
import { Config, Effect } from "effect"
import { runMigrations } from "./migrations"
import { makePostgresLayer } from "./Postgres"
import { makeSqliteLayer } from "./Sqlite"
import { seedDemoData } from "./seed"

type Command = "migrate" | "reset" | "seed"
type Adapter = "sqlite" | "postgres"

const isCommand = (value: string): value is Command =>
  value === "migrate" || value === "reset" || value === "seed"

const isAdapter = (value: string): value is Adapter =>
  value === "sqlite" || value === "postgres"

const getArgValue = (args: ReadonlyArray<string>, name: string) => {
  const prefix = `${name}=`
  const inline = args.find((arg) => arg.startsWith(prefix))
  if (inline !== undefined) {
    return inline.slice(prefix.length)
  }

  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

const parseCommand = (args: ReadonlyArray<string>) => {
  const command = args.find(isCommand)

  if (command === undefined) {
    return Effect.fail(
      new Error("Missing database command. Use migrate, seed, or reset."),
    )
  }

  return Effect.succeed(command)
}

const parseAdapter = (args: ReadonlyArray<string>) => {
  const adapter = getArgValue(args, "--adapter") ?? "sqlite"
  if (!isAdapter(adapter)) {
    return Effect.fail(
      new Error(
        `Invalid database adapter: ${adapter}. Use sqlite or postgres.`,
      ),
    )
  }

  return Effect.succeed(adapter)
}

const resetSqliteFile = Effect.gen(function* () {
  const filename = yield* Config.nonEmptyString("SQLITE_FILENAME").pipe(
    Config.withDefault("./.data/app.db"),
  )
  const files = [filename, `${filename}-wal`, `${filename}-shm`]

  yield* Effect.logInfo("resetting sqlite database").pipe(
    Effect.annotateLogs({ filename, directory: dirname(filename) }),
  )

  for (const file of files) {
    yield* Effect.tryPromise({
      try: () => rm(file, { force: true }),
      catch: (cause) =>
        new Error(`Failed to remove SQLite database file ${file}`, { cause }),
    })
  }
})

const makeSqliteCommand = (command: Command) => {
  const layer = makeSqliteLayer({ migrate: false, seed: false })

  if (command === "migrate") {
    return runMigrations().pipe(Effect.provide(layer))
  }

  if (command === "seed") {
    return Effect.gen(function* () {
      yield* runMigrations()
      yield* seedDemoData
    }).pipe(Effect.provide(layer))
  }

  return Effect.gen(function* () {
    yield* resetSqliteFile
    yield* runMigrations().pipe(Effect.provide(layer))
  })
}

const makePostgresCommand = (command: Command) => {
  if (command === "reset") {
    return Effect.fail(
      new Error("Postgres reset is intentionally not scripted."),
    )
  }

  const layer = makePostgresLayer({ migrate: false })

  if (command === "migrate") {
    return runMigrations().pipe(Effect.provide(layer))
  }

  return Effect.gen(function* () {
    yield* runMigrations()
    yield* seedDemoData
  }).pipe(Effect.provide(layer))
}

const program = Effect.gen(function* () {
  const args = process.argv.slice(2)
  const command = yield* parseCommand(args)
  const adapter = yield* parseAdapter(args)

  yield* Effect.logInfo("running database command").pipe(
    Effect.annotateLogs({ command, adapter }),
  )

  const result = yield* adapter === "sqlite"
    ? makeSqliteCommand(command)
    : makePostgresCommand(command)

  yield* Effect.logInfo("database command complete").pipe(
    Effect.annotateLogs({ command, adapter }),
  )

  return result
})

program.pipe(NodeRuntime.runMain)
