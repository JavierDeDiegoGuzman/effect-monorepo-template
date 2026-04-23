import { CreateTodoInput, UpdateTodoInput } from "@app/shared"
import { Console, Effect } from "effect"
import { Argument, Command, Flag } from "effect/unstable/cli"
import { ApiClient } from "../api/client"
import { writeJson } from "../output"

const formatTodo = (todo: {
  readonly id: number
  readonly title: string
  readonly completed: boolean
}) => `${todo.completed ? "[x]" : "[ ]"} ${todo.id} ${todo.title}`

export const todos = Command.make("todos").pipe(
  Command.withDescription("Inspect and modify todos"),
)

export const listTodos = Command.make(
  "list",
  {
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print machine-readable output"),
    ),
  },
  Effect.fn(function* ({ json }) {
    const client = yield* ApiClient
    const items = yield* client.todos.list()

    if (json) {
      yield* writeJson(items)
      return
    }

    if (items.length === 0) {
      yield* Console.log("No todos found")
      return
    }

    for (const todo of items) {
      yield* Console.log(formatTodo(todo))
    }
  }),
).pipe(Command.withDescription("List todos"), Command.withAlias("ls"))

export const getTodo = Command.make(
  "get",
  {
    id: Argument.integer("id").pipe(
      Argument.withDescription("Todo identifier"),
    ),
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print machine-readable output"),
    ),
  },
  Effect.fn(function* ({ id, json }) {
    const client = yield* ApiClient
    const todo = yield* client.todos.getById({ params: { id } })

    if (json) {
      yield* writeJson(todo)
      return
    }

    yield* Console.log(formatTodo(todo))
  }),
).pipe(Command.withDescription("Get one todo"))

export const createTodo = Command.make(
  "create",
  {
    title: Argument.string("title").pipe(
      Argument.withDescription("Todo title"),
    ),
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print machine-readable output"),
    ),
  },
  Effect.fn(function* ({ title, json }) {
    const client = yield* ApiClient
    const todo = yield* client.todos.create({
      payload: new CreateTodoInput({ title }),
    })

    if (json) {
      yield* writeJson(todo)
      return
    }

    yield* Console.log(`Created ${formatTodo(todo)}`)
  }),
).pipe(Command.withDescription("Create a todo"))

export const updateTodo = Command.make(
  "update",
  {
    id: Flag.integer("id").pipe(Flag.withDescription("Todo identifier")),
    completed: Flag.choice("completed", ["true", "false"]).pipe(
      Flag.withDescription("Set the completed state"),
    ),
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print machine-readable output"),
    ),
  },
  Effect.fn(function* ({ id, completed, json }) {
    const client = yield* ApiClient
    const todo = yield* client.todos.update({
      params: { id },
      payload: new UpdateTodoInput({ completed: completed === "true" }),
    })

    if (json) {
      yield* writeJson(todo)
      return
    }

    yield* Console.log(`Updated ${formatTodo(todo)}`)
  }),
).pipe(Command.withDescription("Update a todo"))
