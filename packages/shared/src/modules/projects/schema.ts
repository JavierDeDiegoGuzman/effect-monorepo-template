import { Schema } from "effect"

export class Project extends Schema.Class<Project>("Project")({
  id: Schema.Number,
  userId: Schema.Number,
  name: Schema.String,
  description: Schema.String,
  archived: Schema.Boolean,
}) {}
