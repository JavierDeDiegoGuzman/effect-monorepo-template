import { NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { HttpServerLayer } from "./http/server"
import { ObservabilityLayer } from "./infra/observability/Observability"
import { HttpServerDependenciesLayer } from "./layers/ServerLayers"

const AppLayer = Layer.provide(
  HttpServerLayer,
  HttpServerDependenciesLayer,
).pipe(Layer.provideMerge(ObservabilityLayer))

Layer.launch(AppLayer).pipe(Effect.orDie, NodeRuntime.runMain)
