import { Schema } from "effect"

export class Project extends Schema.Class<Project>("Project")({
  id: Schema.Number,
  userId: Schema.Number,
  name: Schema.String,
  description: Schema.String,
  archived: Schema.Boolean,
}) {}

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
