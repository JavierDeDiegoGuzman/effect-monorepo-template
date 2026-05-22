import { Effect, Schema } from "effect"

export class InternalServerError extends Schema.TaggedErrorClass<InternalServerError>()(
  "InternalServerError",
  {
    message: Schema.String.pipe(
      Schema.withConstructorDefault(Effect.succeed("Something went wrong")),
    ),
  },
  { httpApiStatus: 500 },
) {}
