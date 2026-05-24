import { makeUserId } from "@app/shared"
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { makeSqlRepositoriesTestLayer } from "../../test/layers/SqlRepositoriesTestLayer"
import { UsersRepository } from "./repository"

describe("SqlUsersRepository", () => {
  it.effect("creates and reads users by id and email", () =>
    Effect.gen(function* () {
      const usersRepository = yield* UsersRepository
      const id = makeUserId("00000000-0000-4000-8000-000000000201")

      const created = yield* usersRepository.create({
        id,
        name: "Alice",
        email: "alice@example.com",
      })

      const byId = yield* usersRepository.getById(created.id)
      const byEmail = yield* usersRepository.findByEmail("alice@example.com")

      assert.deepStrictEqual(byId, created)
      assert.deepStrictEqual(byEmail, created)
    }).pipe(Effect.provide(makeSqlRepositoriesTestLayer({ seed: false }))),
  )

  it.effect("reads seeded users without credential data", () =>
    Effect.gen(function* () {
      const usersRepository = yield* UsersRepository

      const alice = yield* usersRepository.findByEmail("alice@example.com")

      assert.strictEqual(alice?.name, "Alice")
      assert.strictEqual(alice?.email, "alice@example.com")
    }).pipe(Effect.provide(makeSqlRepositoriesTestLayer({ seed: true }))),
  )
})
