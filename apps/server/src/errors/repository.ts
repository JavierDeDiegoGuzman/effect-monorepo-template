import { Schema } from "effect"

export class RepositoryError extends Schema.TaggedErrorClass<RepositoryError>()(
  "RepositoryError",
  {
    repository: Schema.String,
    operation: Schema.String,
  },
) {}
