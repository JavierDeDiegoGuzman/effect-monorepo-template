import { NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import { makeHttpServerLayer } from "./http/server"
import { ProdServerDependenciesLayer } from "./layers/ServerLayers"
import { ObservabilityLayer } from "./observability/Observability"

const AppLayer = makeHttpServerLayer(ProdServerDependenciesLayer).pipe(
  Layer.provideMerge(ObservabilityLayer),
)

Layer.launch(AppLayer).pipe(Effect.orDie, NodeRuntime.runMain)
