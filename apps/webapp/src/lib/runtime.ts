import { Layer } from "effect"
import * as Atom from "effect/unstable/reactivity/Atom"
import { ApiClient } from "@/api/client"
import { ObservabilityLayer } from "@/observability"

export const apiRuntime = Atom.runtime<ApiClient, never>(
  Layer.mergeAll(ApiClient.layer, ObservabilityLayer),
)
