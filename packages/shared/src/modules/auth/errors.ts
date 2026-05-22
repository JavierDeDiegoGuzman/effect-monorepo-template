import { Effect, Schema } from "effect"

export class InvalidCredentials extends Schema.TaggedErrorClass<InvalidCredentials>()(
  "InvalidCredentials",
  {
    message: Schema.String.pipe(
      Schema.withConstructorDefault(
        Effect.succeed("Invalid email or password"),
      ),
    ),
  },
  { httpApiStatus: 401 },
) {}
