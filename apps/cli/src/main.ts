import { NodeRuntime, NodeServices } from "@effect/platform-node"
import { Effect } from "effect"
import { Command } from "effect/unstable/cli"
import { ApiClient } from "./api/client"
import { health } from "./commands/health"
import {
  archiveProject,
  createProject,
  getProject,
  listProjects,
  projects,
  updateProject,
} from "./commands/projects"
import {
  createTodo,
  getTodo,
  listTodos,
  todos,
  updateTodo,
} from "./commands/todos"

const root = Command.make("todo").pipe(
  Command.withDescription("Debug and test the template HTTP API"),
)

root.pipe(
  Command.withSubcommands([
    health,
    todos.pipe(
      Command.withSubcommands([listTodos, getTodo, createTodo, updateTodo]),
    ),
    projects.pipe(
      Command.withSubcommands([
        listProjects,
        getProject,
        createProject,
        updateProject,
        archiveProject,
      ]),
    ),
  ]),
  Command.run({
    version: "0.1.0",
  }),
  Effect.provide(ApiClient.layer),
  Effect.provide(NodeServices.layer),
  NodeRuntime.runMain,
)
