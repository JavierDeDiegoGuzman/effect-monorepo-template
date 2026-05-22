import { dirname } from "node:path"
import { NodeFileSystem } from "@effect/platform-node"
import { Config, Context, Effect, FileSystem, Layer, Semaphore } from "effect"

export type JsonUserRecord = {
  readonly id: number
  readonly email: string
  readonly name: string
  readonly passwordHash: string
}

export type JsonTodoRecord = {
  readonly id: number
  readonly userId: number
  readonly title: string
  readonly completed: boolean
}

export type JsonDatabaseState = {
  readonly users: ReadonlyArray<JsonUserRecord>
  readonly todos: ReadonlyArray<JsonTodoRecord>
}

const emptyState: JsonDatabaseState = {
  users: [],
  todos: [],
}

const seedState: JsonDatabaseState = {
  users: [
    {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      passwordHash: "seed:alice",
    },
    {
      id: 2,
      name: "Bob",
      email: "bob@example.com",
      passwordHash: "seed:bob",
    },
  ],
  todos: [
    {
      id: 1,
      userId: 1,
      title: "Learn Effect HttpApi",
      completed: true,
    },
    {
      id: 2,
      userId: 2,
      title: "Build the webapp",
      completed: false,
    },
  ],
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isJsonUserRecord = (value: unknown): value is JsonUserRecord =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.email === "string" &&
  typeof value.name === "string" &&
  typeof value.passwordHash === "string"

const isJsonTodoRecord = (value: unknown): value is JsonTodoRecord =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.userId === "number" &&
  typeof value.title === "string" &&
  typeof value.completed === "boolean"

const parseState = (content: string): JsonDatabaseState => {
  const value = JSON.parse(content) as unknown

  if (
    !isRecord(value) ||
    !Array.isArray(value.users) ||
    !Array.isArray(value.todos) ||
    !value.users.every(isJsonUserRecord) ||
    !value.todos.every(isJsonTodoRecord)
  ) {
    throw new Error("Invalid JSON database shape")
  }

  return {
    users: value.users,
    todos: value.todos,
  }
}

const stringifyState = (state: JsonDatabaseState) =>
  `${JSON.stringify(state, null, 2)}\n`

export class JsonDatabase extends Context.Service<
  JsonDatabase,
  {
    readonly read: Effect.Effect<JsonDatabaseState>
    readonly update: <A>(
      f: (state: JsonDatabaseState) => readonly [JsonDatabaseState, A],
    ) => Effect.Effect<A>
  }
>()("app/database/JsonDatabase") {}

export const makeJsonDatabaseLayer = (options: {
  readonly filename: string
  readonly seed?: boolean
}) =>
  Layer.effect(
    JsonDatabase,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const lock = yield* Semaphore.make(1)
      const initialState = options.seed === false ? emptyState : seedState

      yield* fs.makeDirectory(dirname(options.filename), { recursive: true })

      const exists = yield* fs.exists(options.filename)
      if (!exists) {
        yield* fs.writeFileString(
          options.filename,
          stringifyState(initialState),
        )
      }

      const readState = Effect.gen(function* () {
        const content = yield* fs.readFileString(options.filename)
        return yield* Effect.try({
          try: () => parseState(content),
          catch: (error) => error,
        })
      })

      const writeState = (state: JsonDatabaseState) =>
        fs.writeFileString(options.filename, stringifyState(state))

      const read = readState.pipe(lock.withPermit, Effect.orDie)

      const update = <A>(
        f: (state: JsonDatabaseState) => readonly [JsonDatabaseState, A],
      ) =>
        Effect.gen(function* () {
          const state = yield* readState
          const [nextState, result] = f(state)
          yield* writeState(nextState)
          return result
        }).pipe(lock.withPermit, Effect.orDie)

      return JsonDatabase.of({
        read,
        update,
      })
    }),
  ).pipe(Layer.provide(NodeFileSystem.layer))

export const JsonDatabaseLayer = Layer.unwrap(
  Effect.gen(function* () {
    const filename = yield* Config.nonEmptyString("JSON_DB_FILENAME").pipe(
      Config.withDefault("./.data/app.json"),
    )

    return makeJsonDatabaseLayer({ filename })
  }),
)
