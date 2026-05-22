import { User } from "@app/shared"
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { makeJsonRepositoriesTestLayer } from "../../test/layers/JsonRepositoriesTestLayer"
import { UsersRepository } from "./repository"

describe("JsonUsersRepository", () => {
  it.effect("creates and loads a user from a temporary json database", () =>
    Effect.gen(function* () {
      const repository = yield* UsersRepository

      const created = yield* repository.create({
        name: "Ada",
        email: "ada@example.com",
        passwordHash: "hash",
      })

      const loaded = yield* repository.getById(created.id)
      const auth = yield* repository.getAuthByEmail("ada@example.com")

      assert.deepStrictEqual(loaded, created)
      assert.deepStrictEqual(auth, {
        user: created,
        passwordHash: "hash",
      })
    }).pipe(Effect.provide(makeJsonRepositoriesTestLayer())),
  )

  it.effect("can use seeded json data", () =>
    Effect.gen(function* () {
      const repository = yield* UsersRepository

      const seeded = yield* repository.getById(1)

      assert.deepStrictEqual(
        seeded,
        new User({
          id: 1,
          name: "Alice",
          email: "alice@example.com",
        }),
      )
    }).pipe(Effect.provide(makeJsonRepositoriesTestLayer({ seed: true }))),
  )
})
