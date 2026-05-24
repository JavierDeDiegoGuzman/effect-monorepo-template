import { Effect, Schema } from "effect"
import { UserId } from "./schema"

export class UserNotFound extends Schema.TaggedErrorClass<UserNotFound>()(
  "UserNotFound",
  {
    id: UserId,
    message: Schema.String.pipe(
      Schema.withConstructorDefault(Effect.succeed("User not found")),
    ),
  },
) {}

export class UserAlreadyExists extends Schema.TaggedErrorClass<UserAlreadyExists>()(
  "UserAlreadyExists",
  {
    email: Schema.String,
    message: Schema.String.pipe(
      Schema.withConstructorDefault(Effect.succeed("User already exists")),
    ),
  },
  { httpApiStatus: 409 },
) {}
