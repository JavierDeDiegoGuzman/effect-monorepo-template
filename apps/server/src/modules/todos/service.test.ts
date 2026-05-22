import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { InMemoryDomainTestLayer } from "../../test/layers/DomainTestLayer"
import { Todos } from "./service"

const assertTodoNotFound = (
  error: { readonly _tag: string; readonly id?: number },
  id: number,
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

      const todo = yield* todos.createForUser(1, {
        title: " Write tests ",
      })

      assert.strictEqual(todo.userId, 1)
      assert.strictEqual(todo.title, "Write tests")
      assert.strictEqual(todo.completed, false)
    }).pipe(Effect.provide(InMemoryDomainTestLayer)),
  )

  it.effect("lists only todos owned by the requested user", () =>
    Effect.gen(function* () {
      const todos = yield* Todos

      const userTodo = yield* todos.createForUser(1, {
        title: "Visible todo",
      })
      yield* todos.createForUser(2, {
        title: "Other user's todo",
      })

      const listed = yield* todos.listByUser(1)

      assert.deepStrictEqual(listed, [userTodo])
    }).pipe(Effect.provide(InMemoryDomainTestLayer)),
  )

  it.effect("does not return another user's todo by id", () =>
    Effect.gen(function* () {
      const todos = yield* Todos

      const otherUserTodo = yield* todos.createForUser(2, {
        title: "Private todo",
      })

      const error = yield* todos
        .getByIdForUser(1, otherUserTodo.id)
        .pipe(Effect.flip)

      assertTodoNotFound(error, otherUserTodo.id)
    }).pipe(Effect.provide(InMemoryDomainTestLayer)),
  )

  it.effect("does not update another user's todo", () =>
    Effect.gen(function* () {
      const todos = yield* Todos

      const otherUserTodo = yield* todos.createForUser(2, {
        title: "Private todo",
      })

      const error = yield* todos
        .updateForUser(1, otherUserTodo.id, { completed: true })
        .pipe(Effect.flip)
      const unchanged = yield* todos.getByIdForUser(2, otherUserTodo.id)

      assertTodoNotFound(error, otherUserTodo.id)
      assert.strictEqual(unchanged.completed, false)
    }).pipe(Effect.provide(InMemoryDomainTestLayer)),
  )
})
