import { Schema } from "effect"

export class ProjectNotFound extends Schema.TaggedErrorClass<ProjectNotFound>()(
  "ProjectNotFound",
  {
    id: Schema.Number,
  },
) {}
