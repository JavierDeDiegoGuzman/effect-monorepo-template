import { NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { HttpServerDependenciesLayer, HttpServerLayer } from "./http/server"
import { ObservabilityLayer } from "./observability"

const AppLayer = Layer.provide(
  HttpServerLayer,
  HttpServerDependenciesLayer,
).pipe(Layer.provideMerge(ObservabilityLayer))

Layer.launch(AppLayer).pipe(Effect.orDie, NodeRuntime.runMain)
