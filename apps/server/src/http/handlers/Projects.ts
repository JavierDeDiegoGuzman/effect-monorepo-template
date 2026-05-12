import { Api, CurrentUser, type ProjectNotFound } from "@app/shared"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Projects } from "../../services/Projects"

export const ProjectsApiHandlers = HttpApiBuilder.group(
  Api,
  "projects",
  Effect.fn(function* (handlers) {
    const projects = yield* Projects

    return handlers
      .handle("list", () =>
        Effect.gen(function* () {
          const user = yield* CurrentUser
          return yield* projects.listByUser(user.id)
        }).pipe(
          Effect.annotateSpans({
            "http.route": "/projects",
            "http.method": "GET",
          }),
        ),
      )
      .handle("getById", ({ params }) =>
        Effect.gen(function* () {
          const user = yield* CurrentUser
          return yield* projects.getByIdForUser(user.id, params.id)
        }).pipe(
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
        Effect.gen(function* () {
          const user = yield* CurrentUser
          return yield* projects.createForUser(user.id, payload)
        }).pipe(
          Effect.annotateSpans({
            "http.route": "/projects",
            "http.method": "POST",
            "project.name.length": payload.name.length,
            "project.description.length": payload.description.length,
          }),
        ),
      )
      .handle("update", ({ params, payload }) =>
        Effect.gen(function* () {
          const user = yield* CurrentUser
          return yield* projects.updateForUser(user.id, params.id, payload)
        }).pipe(
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
        Effect.gen(function* () {
          const user = yield* CurrentUser
          return yield* projects.archiveForUser(user.id, params.id)
        }).pipe(
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
)
