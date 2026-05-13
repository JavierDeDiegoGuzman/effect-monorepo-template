import { NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { HttpServerLayer } from "./http/server"
import { HttpServerDependenciesLayer } from "./layers/ServerLayers"
import { ObservabilityLayer } from "./observability/Observability"

const AppLayer = Layer.provide(
  HttpServerLayer,
  HttpServerDependenciesLayer,
).pipe(Layer.provideMerge(ObservabilityLayer))

Layer.launch(AppLayer).pipe(Effect.orDie, NodeRuntime.runMain)
