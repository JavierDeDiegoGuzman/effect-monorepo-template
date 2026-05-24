import { Schema } from "effect"
import { UserId } from "../users"

export const TodoId = Schema.String.pipe(
  Schema.check(Schema.isUUID(4)),
  Schema.brand("TodoId"),
)

export type TodoId = typeof TodoId.Type

export const makeTodoId = Schema.decodeUnknownSync(TodoId)

export class Todo extends Schema.Class<Todo>("Todo")({
  id: TodoId,
  userId: UserId,
  title: Schema.String,
  completed: Schema.Boolean,
}) {}
