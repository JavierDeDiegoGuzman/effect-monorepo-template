import { Schema } from "effect"

export class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  email: Schema.String,
  name: Schema.String,
}) {}

export class UserNotFound extends Schema.TaggedErrorClass<UserNotFound>()(
  "UserNotFound",
  {
    id: Schema.Number,
  },
) {}

export class UserAlreadyExists extends Schema.TaggedErrorClass<UserAlreadyExists>()(
  "UserAlreadyExists",
  {
    email: Schema.String,
  },
  { httpApiStatus: 409 },
) {}

export class InvalidCredentials extends Schema.TaggedErrorClass<InvalidCredentials>()(
  "InvalidCredentials",
  {
    message: Schema.String,
  },
  { httpApiStatus: 401 },
) {}
