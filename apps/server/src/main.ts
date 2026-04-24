import { NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { Projects } from "./services/Projects"
import { HttpServerLayer } from "./http/server"
import { ObservabilityLayer } from "./observability"

Layer.launch(
  HttpServerLayer.pipe(
    Layer.provideMerge(ObservabilityLayer),
    Layer.provideMerge(Projects.layer),
  ),
).pipe(Effect.orDie, NodeRuntime.runMain)
