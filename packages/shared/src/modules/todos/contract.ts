import { Schema } from "effect"

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
