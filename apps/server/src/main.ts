import { NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import { HttpServerLayer } from "./http/server"

Layer.launch(HttpServerLayer).pipe(NodeRuntime.runMain)
