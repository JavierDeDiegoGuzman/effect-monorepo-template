import { Schema } from "effect"
import { User } from "./User"

export class RegisterInput extends Schema.Class<RegisterInput>("RegisterInput")(
  {
    name: Schema.String,
    email: Schema.String,
    password: Schema.String,
  },
) {}

export class LoginInput extends Schema.Class<LoginInput>("LoginInput")({
  email: Schema.String,
  password: Schema.String,
}) {}

export class CurrentSession extends Schema.Class<CurrentSession>(
  "CurrentSession",
)({
  user: User,
}) {}

export class AuthSession extends Schema.Class<AuthSession>("AuthSession")({
  token: Schema.String,
  user: User,
}) {}
