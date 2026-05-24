import { Schema } from "effect"

export const UserId = Schema.String.pipe(
  Schema.check(Schema.isUUID(4)),
  Schema.brand("UserId"),
)

export type UserId = typeof UserId.Type

export const makeUserId = Schema.decodeUnknownSync(UserId)

export class User extends Schema.Class<User>("User")({
  id: UserId,
  email: Schema.String,
  name: Schema.String,
}) {}
