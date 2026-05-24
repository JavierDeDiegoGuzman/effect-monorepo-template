import { UserAlreadyExists } from "@app/shared"
import { assert, describe, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { makeInMemoryRepositoriesLayer } from "../../test/layers/InMemoryRepositoriesLayer"
import { Users } from "./service"
import { UsersLive } from "./service.live"

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
        })

        const error = yield* users
          .create({
            name: "Alice Again",
            email: "ALICE@example.com",
          })
          .pipe(Effect.flip)

        assert.ok(error instanceof UserAlreadyExists)
        assert.strictEqual(error._tag, "UserAlreadyExists")
        assert.strictEqual(error.email, "alice@example.com")
        assert.strictEqual(error.message, "User already exists")
      }).pipe(Effect.provide(makeUsersDomainTestLayer())),
  )
})
