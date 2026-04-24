import {
  CreateProjectInput,
  type Project,
  UpdateProjectInput,
} from "@app/shared"
import { Console, Effect } from "effect"
import { Argument, Command, Flag } from "effect/unstable/cli"
import { ApiClient } from "../api/client"
import { writeJson } from "../output"

const formatProject = (project: Project) => {
  const status = project.archived ? "[A]" : "[ ]"
  const description = project.description.length > 0 ? ` — ${project.description}` : ""
  return `${status} ${project.id} ${project.name}${description}`
}

export const projects = Command.make("projects").pipe(
  Command.withDescription("Inspect and modify projects"),
)

export const listProjects = Command.make(
  "list",
  {
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print machine-readable output"),
    ),
  },
  Effect.fn(function* ({ json }) {
    const client = yield* ApiClient
    const items = yield* client.projects.list()

    if (json) {
      yield* writeJson(items)
      return
    }

    if (items.length === 0) {
      yield* Console.log("No projects found")
      return
    }

    for (const project of items) {
      yield* Console.log(formatProject(project))
    }
  }),
).pipe(Command.withDescription("List projects"), Command.withAlias("ls"))

export const getProject = Command.make(
  "get",
  {
    id: Argument.integer("id").pipe(
      Argument.withDescription("Project identifier"),
    ),
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print machine-readable output"),
    ),
  },
  Effect.fn(function* ({ id, json }) {
    const client = yield* ApiClient
    const project = yield* client.projects.getById({ params: { id } })

    if (json) {
      yield* writeJson(project)
      return
    }

    yield* Console.log(formatProject(project))
  }),
).pipe(Command.withDescription("Get one project"))

export const createProject = Command.make(
  "create",
  {
    name: Argument.string("name").pipe(
      Argument.withDescription("Project name"),
    ),
    description: Flag.string("description").pipe(
      Flag.withDescription("Project description"),
      Flag.withDefault(""),
    ),
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print machine-readable output"),
    ),
  },
  Effect.fn(function* ({ name, description, json }) {
    const client = yield* ApiClient
    const project = yield* client.projects.create({
      payload: new CreateProjectInput({ name, description }),
    })

    if (json) {
      yield* writeJson(project)
      return
    }

    yield* Console.log(`Created ${formatProject(project)}`)
  }),
).pipe(Command.withDescription("Create a project"))

export const updateProject = Command.make(
  "update",
  {
    id: Flag.integer("id").pipe(Flag.withDescription("Project identifier")),
    name: Flag.string("name").pipe(
      Flag.withDescription("Project name"),
      Flag.withDefault(""),
    ),
    description: Flag.string("description").pipe(
      Flag.withDescription("Project description"),
      Flag.withDefault(""),
    ),
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print machine-readable output"),
    ),
  },
  Effect.fn(function* ({ id, name, description, json }) {
    const client = yield* ApiClient
    const project = yield* client.projects.update({
      params: { id },
      payload: new UpdateProjectInput({ name, description }),
    })

    if (json) {
      yield* writeJson(project)
      return
    }

    yield* Console.log(`Updated ${formatProject(project)}`)
  }),
).pipe(Command.withDescription("Update a project"))

export const archiveProject = Command.make(
  "archive",
  {
    id: Flag.integer("id").pipe(Flag.withDescription("Project identifier")),
    json: Flag.boolean("json").pipe(
      Flag.withDescription("Print machine-readable output"),
    ),
  },
  Effect.fn(function* ({ id, json }) {
    const client = yield* ApiClient
    const project = yield* client.projects.archive({ params: { id } })

    if (json) {
      yield* writeJson(project)
      return
    }

    yield* Console.log(`Archived ${formatProject(project)}`)
  }),
).pipe(Command.withDescription("Archive a project"))
