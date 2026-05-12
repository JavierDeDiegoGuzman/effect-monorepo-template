import { Schema } from "effect"

export class Todo extends Schema.Class<Todo>("Todo")({
  id: Schema.Number,
  userId: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean,
  projectId: Schema.NullOr(Schema.Number),
}) {}

export class CreateTodoInput extends Schema.Class<CreateTodoInput>(
  "CreateTodoInput",
)({
  title: Schema.String,
  projectId: Schema.NullOr(Schema.Number),
}) {}

export class UpdateTodoInput extends Schema.Class<UpdateTodoInput>(
  "UpdateTodoInput",
)({
  completed: Schema.Boolean,
}) {}
