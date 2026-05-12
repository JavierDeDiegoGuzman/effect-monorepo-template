import { Schema } from "effect"
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "effect/unstable/httpapi"
import { Project } from "../../domain/Project"
import { ProjectNotFound } from "../../domain/ProjectErrors"
import { Authorization } from "../middleware/Authorization"

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

export class ProjectsApi extends HttpApiGroup.make("projects")
  .add(
    HttpApiEndpoint.get("list", "/projects", {
      success: Schema.Array(Project),
    }),
    HttpApiEndpoint.get("getById", "/projects/:id", {
      params: {
        id: Schema.NumberFromString,
      },
      success: Project,
      error: ProjectNotFound.pipe(
        HttpApiSchema.asNoContent({
          decode: () => new ProjectNotFound({ id: -1 }),
        }),
      ),
    }),
    HttpApiEndpoint.post("create", "/projects", {
      payload: CreateProjectInput,
      success: Project,
    }),
    HttpApiEndpoint.patch("update", "/projects/:id", {
      params: {
        id: Schema.NumberFromString,
      },
      payload: UpdateProjectInput,
      success: Project,
      error: ProjectNotFound.pipe(
        HttpApiSchema.asNoContent({
          decode: () => new ProjectNotFound({ id: -1 }),
        }),
      ),
    }),
    HttpApiEndpoint.post("archive", "/projects/:id/archive", {
      params: {
        id: Schema.NumberFromString,
      },
      success: Project,
      error: ProjectNotFound.pipe(
        HttpApiSchema.asNoContent({
          decode: () => new ProjectNotFound({ id: -1 }),
        }),
      ),
    }),
  )
  .middleware(Authorization)
  .annotateMerge(
    OpenApi.annotations({
      title: "Projects",
      description: "Project management endpoints",
    }),
  ) {}
