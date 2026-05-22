import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { makeJsonRepositoriesTestLayer } from "../../test/layers/JsonRepositoriesTestLayer"
import { TodosRepository } from "./repository"

describe("JsonTodosRepository", () => {
  it.effect(
    "creates, lists, and updates todos in a temporary json database",
    () =>
      Effect.gen(function* () {
        const repository = yield* TodosRepository

        const first = yield* repository.createForUser({
          userId: 1,
          title: "Write JSON adapter tests",
        })
        const second = yield* repository.createForUser({
          userId: 2,
          title: "Keep users isolated",
        })

        yield* repository.updateCompletedForUser({
          userId: 1,
          id: first.id,
          completed: true,
        })

        const userOneTodos = yield* repository.listByUser(1)
        const loadedForOwner = yield* repository.getByIdForUser(1, first.id)
        const loadedForOtherUser = yield* repository.getByIdForUser(2, first.id)

        assert.strictEqual(userOneTodos.length, 1)
        assert.strictEqual(loadedForOwner?.id, first.id)
        assert.strictEqual(loadedForOwner?.userId, first.userId)
        assert.strictEqual(loadedForOwner?.title, first.title)
        assert.strictEqual(loadedForOwner?.completed, true)
        assert.strictEqual(loadedForOtherUser, null)
        assert.strictEqual(second.userId, 2)
      }).pipe(Effect.provide(makeJsonRepositoriesTestLayer())),
  )
})
