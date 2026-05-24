import { makeTodoId, makeUserId } from "@app/shared"
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { InMemoryDomainTestLayer } from "../../test/layers/DomainTestLayer"
import { Todos } from "./service"

const userOneId = makeUserId("00000000-0000-4000-8000-000000000001")
const userTwoId = makeUserId("00000000-0000-4000-8000-000000000002")
const missingTodoId = makeTodoId("00000000-0000-4000-8000-000000000999")

const assertTodoNotFound = (
  error: { readonly _tag: string; readonly id?: unknown },
  id: unknown,
) => {
  assert.strictEqual(error._tag, "TodoNotFound")
  assert.strictEqual(error.id, id)
  assert.strictEqual(
    (error as { readonly message?: string }).message,
    "Todo not found",
  )
}

describe("Todos domain service", () => {
  it.effect("creates a trimmed todo for the user", () =>
    Effect.gen(function* () {
      const todos = yield* Todos

      const todo = yield* todos.createForUser(userOneId, {
        title: " Write tests ",
      })

      assert.strictEqual(todo.userId, userOneId)
      assert.strictEqual(todo.title, "Write tests")
      assert.strictEqual(todo.completed, false)
    }).pipe(Effect.provide(InMemoryDomainTestLayer)),
  )

  it.effect("lists only todos owned by the requested user", () =>
    Effect.gen(function* () {
      const todos = yield* Todos

      const userTodo = yield* todos.createForUser(userOneId, {
        title: "Visible todo",
      })
      yield* todos.createForUser(userTwoId, {
        title: "Other user's todo",
      })

      const listed = yield* todos.listByUser(userOneId)

      assert.deepStrictEqual(listed, [userTodo])
    }).pipe(Effect.provide(InMemoryDomainTestLayer)),
  )

  it.effect("does not return another user's todo by id", () =>
    Effect.gen(function* () {
      const todos = yield* Todos

      const otherUserTodo = yield* todos.createForUser(userTwoId, {
        title: "Private todo",
      })

      const error = yield* todos
        .getByIdForUser(userOneId, otherUserTodo.id)
        .pipe(Effect.flip)

      assertTodoNotFound(error, otherUserTodo.id)
    }).pipe(Effect.provide(InMemoryDomainTestLayer)),
  )

  it.effect("does not update another user's todo", () =>
    Effect.gen(function* () {
      const todos = yield* Todos

      const otherUserTodo = yield* todos.createForUser(userTwoId, {
        title: "Private todo",
      })

      const error = yield* todos
        .updateForUser(userOneId, otherUserTodo.id, { completed: true })
        .pipe(Effect.flip)
      const unchanged = yield* todos.getByIdForUser(userTwoId, otherUserTodo.id)

      assertTodoNotFound(error, otherUserTodo.id)
      assert.strictEqual(unchanged.completed, false)
    }).pipe(Effect.provide(InMemoryDomainTestLayer)),
  )

  it.effect("returns TodoNotFound for missing todos", () =>
    Effect.gen(function* () {
      const todos = yield* Todos

      const error = yield* todos
        .getByIdForUser(userOneId, missingTodoId)
        .pipe(Effect.flip)

      assertTodoNotFound(error, missingTodoId)
    }).pipe(Effect.provide(InMemoryDomainTestLayer)),
  )
})
