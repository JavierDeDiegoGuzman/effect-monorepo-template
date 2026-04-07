import { Schema } from "effect"

export class TodoNotFound extends Schema.TaggedErrorClass<TodoNotFound>()("TodoNotFound", {
  id: Schema.Number
}) {}
