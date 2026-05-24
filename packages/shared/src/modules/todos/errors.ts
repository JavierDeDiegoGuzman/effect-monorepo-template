import { Effect, Schema } from "effect"
import { TodoId } from "./schema"

export class TodoNotFound extends Schema.TaggedErrorClass<TodoNotFound>()(
  "TodoNotFound",
  {
    id: TodoId,
    message: Schema.String.pipe(
      Schema.withConstructorDefault(Effect.succeed("Todo not found")),
    ),
  },
  { httpApiStatus: 404 },
) {}
