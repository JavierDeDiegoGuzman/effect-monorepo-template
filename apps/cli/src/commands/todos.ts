import { CreateTodoInput, UpdateTodoInput } from "@app/shared"
import { Console, Effect } from "effect"
import { Argument, Command, Flag } from "effect/unstable/cli"
import { ApiClient } from "../api/client"
import { writeJson } from "../output"

const formatTodo = (todo: {
  readonly id: number
  readonly title: string
  readonly completed: boolean
  readonly projectId: number | null
}) =>
  `${todo.completed ? "[x]" : "[ ]"} ${todo.id} ${todo.title}${todo.projectId === null ? "" : ` (project ${todo.projectId})`}`

export const todos = Command.make("todos").pipe(
  Command.withDescription("Inspect and modify todos"),
)

export const listTodos = Command.make(
  "list",
  {
    projectId: Flag.integer("project-id").pipe(
      Flag.withDescription("Filter by project identifier"),
      Flag.withDefault(-1),
    ),
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print machine-readable output"),
    ),
  },
  Effect.fn(function* ({ projectId, json }) {
    const client = yield* ApiClient
    const items =
      projectId === -1
        ? yield* client.todos.list()
        : yield* client.todos.listByProject({ params: { projectId } })

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
    projectId: Flag.integer("project-id").pipe(
      Flag.withDescription("Attach the todo to a project"),
      Flag.withDefault(-1),
    ),
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print machine-readable output"),
    ),
  },
  Effect.fn(function* ({ title, projectId, json }) {
    const client = yield* ApiClient
    const todo = yield* client.todos.create({
      payload: new CreateTodoInput({
        title,
        projectId: projectId === -1 ? null : projectId,
      }),
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
