import { CreateProjectInput, UpdateProjectInput } from "@app/shared"
import { Effect } from "effect"
import * as Layer from "effect/Layer"
import * as Atom from "effect/unstable/reactivity/Atom"
import { ApiClient } from "../api/client"
import { isProbablyJwt, readAuthToken } from "../lib/auth-storage"
import { ObservabilityLayer } from "../observability"

const apiRuntime = Atom.runtime(
  Layer.mergeAll(ApiClient.layer, ObservabilityLayer),
)

export const projectsQuery = apiRuntime
  .atom(
    Effect.sync(readAuthToken).pipe(
      Effect.flatMap((token) => {
        if (token === null || !isProbablyJwt(token)) {
          return Effect.succeed([])
        }

        return ApiClient.use((client) => client.projects.list())
      }),
      Effect.withSpan("projects.list", {
        kind: "client",
      }),
    ),
  )
  .pipe(Atom.keepAlive, Atom.withReactivity(["projects", "auth"]))

export const createProjectAction = apiRuntime.fn(
  (input: CreateProjectInput) =>
    ApiClient.use((client) => client.projects.create({ payload: input })).pipe(
      Effect.annotateSpans({
        "project.name.length": input.name.length,
        "project.description.length": input.description.length,
      }),
      Effect.withSpan("projects.create", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["projects"] },
)

export const updateProjectAction = apiRuntime.fn(
  ({ id, input }: { readonly id: number; readonly input: UpdateProjectInput }) =>
    ApiClient.use((client) =>
      client.projects.update({ params: { id }, payload: input }),
    ).pipe(
      Effect.annotateSpans({
        "project.id": id,
        "project.name.length": input.name.length,
        "project.description.length": input.description.length,
      }),
      Effect.withSpan("projects.update", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["projects"] },
)

export const archiveProjectAction = apiRuntime.fn(
  (id: number) =>
    ApiClient.use((client) => client.projects.archive({ params: { id } })).pipe(
      Effect.annotateSpans({
        "project.id": id,
        "project.archived": true,
      }),
      Effect.withSpan("projects.archive", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["projects"] },
)
