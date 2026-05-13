import { Schema } from "effect"

export class CreateProjectInput extends Schema.Class<CreateProjectInput>(
  "CreateProjectInput",
)({
  name: Schema.String,
  description: Schema.String,
}) {}

export class UpdateProjectInput extends Schema.Class<UpdateProjectInput>(
  "UpdateProjectInput",
)({
  name: Schema.String,
  description: Schema.String,
}) {}
