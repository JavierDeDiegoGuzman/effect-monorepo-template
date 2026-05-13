import { Schema } from "effect"

export class InvalidCredentials extends Schema.TaggedErrorClass<InvalidCredentials>()(
  "InvalidCredentials",
  {
    message: Schema.String,
  },
  { httpApiStatus: 401 },
) {}
