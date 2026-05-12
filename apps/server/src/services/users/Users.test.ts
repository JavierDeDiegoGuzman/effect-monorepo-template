import { assert, describe, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { makeInMemoryRepositoriesLayer } from "../../test/layers/InMemoryRepositoriesLayer"
import { Users } from "./Users"
import { UsersLive } from "./UsersLive"

const makeUsersDomainTestLayer = () =>
  UsersLive.pipe(Layer.provide(makeInMemoryRepositoriesLayer()))

describe("Users domain service", () => {
  it.effect(
    "normalizes data before creating users through the repository",
    () =>
      Effect.gen(function* () {
        const users = yield* Users

        const user = yield* users.create({
          name: " Alice ",
          email: "ALICE@example.com",
          passwordHash: "hash:alice",
        })

        assert.strictEqual(user.name, "Alice")
        assert.strictEqual(user.email, "alice@example.com")
      }).pipe(Effect.provide(makeUsersDomainTestLayer())),
  )

  it.effect(
    "fails with UserAlreadyExists when a normalized email already exists",
    () =>
      Effect.gen(function* () {
        const users = yield* Users

        yield* users.create({
          name: "Alice",
          email: "alice@example.com",
          passwordHash: "hash:alice",
        })

        const error = yield* users
          .create({
            name: "Alice Again",
            email: "ALICE@example.com",
            passwordHash: "hash:again",
          })
          .pipe(Effect.flip)

        assert.strictEqual(error._tag, "UserAlreadyExists")
        assert.strictEqual(error.email, "alice@example.com")
      }).pipe(Effect.provide(makeUsersDomainTestLayer())),
  )
})
