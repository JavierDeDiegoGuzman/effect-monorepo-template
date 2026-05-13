import { Schema } from "effect"

export class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  email: Schema.String,
  name: Schema.String,
}) {}
