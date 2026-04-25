import { Project } from "@app/shared"
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { makeInMemoryDomainTestLayer } from "../test/layers/DomainTestLayer"
import { Todos } from "./Todos"

const project = new Project({
  id: 1,
  workspaceId: 1,
  name: "Template",
  description: "Test project",
  archived: false,
})

describe("Todos domain service", () => {
  it.effect(
    "creates a todo when the referenced project exists in the workspace",
    () =>
      Effect.gen(function* () {
        const todos = yield* Todos

        const todo = yield* todos.createInWorkspace(1, {
          title: " Write tests ",
          projectId: project.id,
        })

        assert.strictEqual(todo.title, "Write tests")
        assert.strictEqual(todo.projectId, project.id)
        assert.strictEqual(todo.completed, false)
      }).pipe(
        Effect.provide(
          makeInMemoryDomainTestLayer({
            projects: [project],
          }),
        ),
      ),
  )

  it.effect(
    "fails with ProjectNotFound when the referenced project is outside the workspace",
    () =>
      Effect.gen(function* () {
        const todos = yield* Todos

        const error = yield* todos
          .createInWorkspace(2, {
            title: "Write tests",
            projectId: project.id,
          })
          .pipe(Effect.flip)

        assert.strictEqual(error._tag, "ProjectNotFound")
        assert.strictEqual(error.id, project.id)
      }).pipe(
        Effect.provide(
          makeInMemoryDomainTestLayer({
            projects: [project],
          }),
        ),
      ),
  )
})
