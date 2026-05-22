import { Effect, Schema } from "effect"

export class UserNotFound extends Schema.TaggedErrorClass<UserNotFound>()(
  "UserNotFound",
  {
    id: Schema.Number,
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
