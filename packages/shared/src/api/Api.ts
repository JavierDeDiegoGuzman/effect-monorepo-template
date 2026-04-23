import { HttpApi, OpenApi } from "effect/unstable/httpapi"
import { SystemApi } from "./groups/SystemApi"
import { TodosApi } from "./groups/TodosApi"

export class Api extends HttpApi.make("todo-api")
  .add(SystemApi)
  .add(TodosApi)
  .annotateMerge(
    OpenApi.annotations({
      title: "Todo API",
    }),
  ) {}
