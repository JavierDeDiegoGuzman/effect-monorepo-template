import { Api, type ProjectNotFound } from "@app/shared"
import { Effect, Layer } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Projects } from "../../services/Projects"

export const ProjectsApiHandlers = HttpApiBuilder.group(
  Api,
  "projects",
  Effect.fn(function* (handlers) {
    const projects = yield* Projects

    return handlers
      .handle("list", () =>
        projects.list.pipe(
          Effect.annotateSpans({
            "http.route": "/projects",
            "http.method": "GET",
          }),
        ),
      )
      .handle("getById", ({ params }) =>
        projects.getById(params.id).pipe(
          Effect.annotateSpans({
            "http.route": "/projects/:id",
            "http.method": "GET",
            "project.id": params.id,
          }),
          Effect.catchTag("ProjectNotFound", (error: ProjectNotFound) =>
            Effect.fail(error),
          ),
        ),
      )
      .handle("create", ({ payload }) =>
        projects.create(payload).pipe(
          Effect.annotateSpans({
            "http.route": "/projects",
            "http.method": "POST",
            "project.name.length": payload.name.length,
            "project.description.length": payload.description.length,
          }),
        ),
      )
      .handle("update", ({ params, payload }) =>
        projects.update(params.id, payload).pipe(
          Effect.annotateSpans({
            "http.route": "/projects/:id",
            "http.method": "PATCH",
            "project.id": params.id,
            "project.name.length": payload.name.length,
            "project.description.length": payload.description.length,
          }),
          Effect.catchTag("ProjectNotFound", (error: ProjectNotFound) =>
            Effect.fail(error),
          ),
        ),
      )
      .handle("archive", ({ params }) =>
        projects.archive(params.id).pipe(
          Effect.annotateSpans({
            "http.route": "/projects/:id/archive",
            "http.method": "POST",
            "project.id": params.id,
            "project.archived": true,
          }),
          Effect.catchTag("ProjectNotFound", (error: ProjectNotFound) =>
            Effect.fail(error),
          ),
        ),
      )
  }),
).pipe(Layer.provide(Projects.layer))
