import { Effect, Schema } from "effect"

export class TodoNotFound extends Schema.TaggedErrorClass<TodoNotFound>()(
  "TodoNotFound",
  {
    id: Schema.Number,
    message: Schema.String.pipe(
      Schema.withConstructorDefault(Effect.succeed("Todo not found")),
    ),
  },
  { httpApiStatus: 404 },
) {}
