import type { UserId } from "@app/shared"
import { Effect, Layer, Ref } from "effect"
import { AuthCredentialsRepository } from "./credentials.repository"

export type InMemoryAuthCredentialRecord = {
  readonly userId: UserId
  readonly passwordHash: string
}

export const makeInMemoryAuthCredentialsRepositoryLayer = (
  initialRecords: ReadonlyArray<InMemoryAuthCredentialRecord> = [],
) =>
  Layer.effect(
    AuthCredentialsRepository,
    Effect.gen(function* () {
      const store = yield* Ref.make(
        new Map(
          initialRecords.map((record) => [record.userId, record.passwordHash]),
        ),
      )

      const findPasswordHashByUserId = Effect.fn(
        "InMemoryAuthCredentialsRepository.findPasswordHashByUserId",
      )(function* (userId) {
        return (yield* Ref.get(store)).get(userId) ?? null
      })

      const createPasswordCredential = Effect.fn(
        "InMemoryAuthCredentialsRepository.createPasswordCredential",
      )(function* (input) {
        yield* Ref.update(store, (current) =>
          new Map(current).set(input.userId, input.passwordHash),
        )
      })

      return AuthCredentialsRepository.of({
        findPasswordHashByUserId,
        createPasswordCredential,
      })
    }),
  )

export const InMemoryAuthCredentialsRepositoryLayer =
  makeInMemoryAuthCredentialsRepositoryLayer()
