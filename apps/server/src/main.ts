import { NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import { HttpServerLayer } from "./http/server"
import { ObservabilityLayer } from "./observability"

Layer.launch(HttpServerLayer.pipe(Layer.provideMerge(ObservabilityLayer))).pipe(
  NodeRuntime.runMain,
)
