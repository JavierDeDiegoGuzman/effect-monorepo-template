import { Schema } from "effect"

export const WorkspaceKind = Schema.Literal("personal")

export const WorkspaceRole = Schema.Literal("owner")

export class Workspace extends Schema.Class<Workspace>("Workspace")({
  id: Schema.Number,
  name: Schema.String,
  kind: WorkspaceKind,
}) {}

export class WorkspaceMember extends Schema.Class<WorkspaceMember>(
  "WorkspaceMember",
)({
  workspaceId: Schema.Number,
  userId: Schema.Number,
  role: WorkspaceRole,
}) {}
