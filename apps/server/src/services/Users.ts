import { User, UserAlreadyExists, UserNotFound } from "@app/shared"
import { Effect, Layer, Ref, ServiceMap } from "effect"

const normalizeEmail = (email: string) => email.trim().toLowerCase()

type UserRecord = {
  readonly user: User
  readonly passwordHash: string
}

export class Users extends ServiceMap.Service<
  Users,
  {
    readonly getById: (id: number) => Effect.Effect<User, UserNotFound>
    readonly getAuthByEmail: (email: string) => Effect.Effect<UserRecord | null>
    readonly create: (input: {
      readonly name: string
      readonly email: string
      readonly passwordHash: string
    }) => Effect.Effect<User, UserAlreadyExists>
  }
>()("app/Users") {
  static readonly layer = Layer.effect(
    Users,
    Effect.gen(function* () {
      const nextId = yield* Ref.make(3)
      const store = new Map<number, UserRecord>([
        [
          1,
          {
            user: new User({
              id: 1,
              name: "Alice",
              email: "alice@example.com",
            }),
            passwordHash: "seed:alice",
          },
        ],
        [
          2,
          {
            user: new User({
              id: 2,
              name: "Bob",
              email: "bob@example.com",
            }),
            passwordHash: "seed:bob",
          },
        ],
      ])

      const getById = Effect.fn("Users.getById")(function* (id: number) {
        const user = store.get(id)?.user
        if (user === undefined) {
          return yield* new UserNotFound({ id })
        }
        return user
      })

      const getAuthByEmail = Effect.fn("Users.getAuthByEmail")(function* (email: string) {
        const normalized = normalizeEmail(email)
        for (const record of store.values()) {
          if (record.user.email === normalized) {
            return record
          }
        }
        return null
      })

      const create = Effect.fn("Users.create")(function* (input: {
        readonly name: string
        readonly email: string
        readonly passwordHash: string
      }) {
        const email = normalizeEmail(input.email)

        for (const record of store.values()) {
          if (record.user.email === email) {
            return yield* new UserAlreadyExists({ email })
          }
        }

        const id = yield* Ref.getAndUpdate(nextId, (current) => current + 1)
        const user = new User({
          id,
          name: input.name.trim(),
          email,
        })
        store.set(id, {
          user,
          passwordHash: input.passwordHash,
        })
        return user
      })

      return Users.of({
        getById,
        getAuthByEmail,
        create,
      })
    }),
  )
}
