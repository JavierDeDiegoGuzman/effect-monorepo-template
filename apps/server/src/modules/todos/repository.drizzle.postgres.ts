import { Todo } from "@app/shared"
import { and, asc, eq } from "drizzle-orm"
import * as PgDrizzle from "drizzle-orm/effect-postgres"
import { Effect, Layer } from "effect"
import { todos } from "../../database/schema.drizzle"
import { TodosRepository } from "./repository"

const toTodo = (row: typeof todos.$inferSelect) =>
  new Todo({
    id: row.id,
    userId: row.userId,
    title: row.title,
    completed: row.completed,
  })

export const DrizzlePostgresTodosRepositoryLayer = Layer.effect(
  TodosRepository,
  Effect.gen(function* () {
    const db = yield* PgDrizzle.makeWithDefaults()

    const listByUser = Effect.fn("DrizzlePostgresTodosRepository.listByUser")(
      function* (userId: number) {
        const rows = yield* db
          .select()
          .from(todos)
          .where(eq(todos.userId, userId))
          .orderBy(asc(todos.id))
          .pipe(Effect.orDie)

        return rows.map(toTodo)
      },
    )

    const getByIdForUser = Effect.fn(
      "DrizzlePostgresTodosRepository.getByIdForUser",
    )(function* (userId: number, id: number) {
      const rows = yield* db
        .select()
        .from(todos)
        .where(and(eq(todos.userId, userId), eq(todos.id, id)))
        .limit(1)
        .pipe(Effect.orDie)

      const row = rows[0]
      return row === undefined ? null : toTodo(row)
    })

    const createForUser = Effect.fn(
      "DrizzlePostgresTodosRepository.createForUser",
    )(function* (input: { readonly userId: number; readonly title: string }) {
      const rows = yield* db
        .insert(todos)
        .values({ userId: input.userId, title: input.title })
        .returning()
        .pipe(Effect.orDie)

      const row = rows[0]
      return row === undefined
        ? yield* Effect.die("Inserted todo not returned")
        : toTodo(row)
    })

    const updateCompletedForUser = Effect.fn(
      "DrizzlePostgresTodosRepository.updateCompletedForUser",
    )(function* (input: {
      readonly userId: number
      readonly id: number
      readonly completed: boolean
    }) {
      yield* db
        .update(todos)
        .set({ completed: input.completed })
        .where(and(eq(todos.userId, input.userId), eq(todos.id, input.id)))
        .pipe(Effect.orDie)
    })

    return TodosRepository.of({
      listByUser,
      getByIdForUser,
      createForUser,
      updateCompletedForUser,
    })
  }),
)
