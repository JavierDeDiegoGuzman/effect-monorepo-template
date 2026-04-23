import { Schema } from "effect"

export class Todo extends Schema.Class<Todo>("Todo")({
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean,
}) {}

export class CreateTodoInput extends Schema.Class<CreateTodoInput>(
  "CreateTodoInput",
)({
  title: Schema.String,
}) {}

export class UpdateTodoInput extends Schema.Class<UpdateTodoInput>(
  "UpdateTodoInput",
)({
  completed: Schema.Boolean,
}) {}
