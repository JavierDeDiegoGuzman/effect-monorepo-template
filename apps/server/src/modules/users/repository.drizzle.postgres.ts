import { User } from "@app/shared"
import { eq } from "drizzle-orm"
import * as PgDrizzle from "drizzle-orm/effect-postgres"
import { Effect, Layer } from "effect"
import { users } from "../../database/schema.drizzle"
import { type UserRecord, UsersRepository } from "./repository"

type UserView = Pick<typeof users.$inferSelect, "id" | "email" | "name">

const toUser = (row: UserView) =>
  new User({
    id: row.id,
    email: row.email,
    name: row.name,
  })

export const DrizzlePostgresUsersRepositoryLayer = Layer.effect(
  UsersRepository,
  Effect.gen(function* () {
    const db = yield* PgDrizzle.makeWithDefaults()

    const getById = Effect.fn("DrizzlePostgresUsersRepository.getById")(
      function* (id: number) {
        const rows = yield* db
          .select({ id: users.id, email: users.email, name: users.name })
          .from(users)
          .where(eq(users.id, id))
          .limit(1)
          .pipe(Effect.orDie)

        const row = rows[0]
        return row === undefined ? null : toUser(row)
      },
    )

    const getAuthByEmail = Effect.fn(
      "DrizzlePostgresUsersRepository.getAuthByEmail",
    )(function* (email: string) {
      const rows = yield* db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
        .pipe(Effect.orDie)

      const row = rows[0]
      if (row === undefined) {
        return null
      }

      return {
        user: toUser(row),
        passwordHash: row.passwordHash,
      } satisfies UserRecord
    })

    const create = Effect.fn("DrizzlePostgresUsersRepository.create")(
      function* (input: {
        readonly name: string
        readonly email: string
        readonly passwordHash: string
      }) {
        const rows = yield* db
          .insert(users)
          .values({
            name: input.name,
            email: input.email,
            passwordHash: input.passwordHash,
          })
          .returning({ id: users.id, email: users.email, name: users.name })
          .pipe(Effect.orDie)

        const row = rows[0]
        return row === undefined
          ? yield* Effect.die("Inserted user not returned")
          : toUser(row)
      },
    )

    return UsersRepository.of({
      getById,
      getAuthByEmail,
      create,
    })
  }),
)
