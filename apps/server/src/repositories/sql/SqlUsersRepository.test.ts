import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { makeSqlRepositoriesTestLayer } from "../../test/layers/SqlRepositoriesTestLayer"
import { UsersRepository } from "../UsersRepository"

describe("SqlUsersRepository", () => {
  it.effect("creates and loads a user from a temporary sqlite database", () =>
    Effect.gen(function* () {
      const usersRepository = yield* UsersRepository

      const user = yield* usersRepository.create({
        name: "Alice",
        email: "alice@example.com",
        passwordHash: "hash:alice",
      })

      const loaded = yield* usersRepository.getById(user.id)
      const authRecord =
        yield* usersRepository.getAuthByEmail("alice@example.com")

      assert.deepStrictEqual(loaded, user)
      assert.deepStrictEqual(authRecord, {
        user,
        passwordHash: "hash:alice",
      })
    }).pipe(Effect.provide(makeSqlRepositoriesTestLayer())),
  )

  it.effect("can use seeded sqlite data", () =>
    Effect.gen(function* () {
      const usersRepository = yield* UsersRepository

      const alice = yield* usersRepository.getAuthByEmail("alice@example.com")

      assert.strictEqual(alice?.user.name, "Alice")
      assert.strictEqual(alice?.passwordHash, "seed:alice")
    }).pipe(Effect.provide(makeSqlRepositoriesTestLayer({ seed: true }))),
  )
})
