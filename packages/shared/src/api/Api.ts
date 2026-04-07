import { HttpApi, OpenApi } from "effect/unstable/httpapi"
import { TodosApi } from "./groups/TodosApi"

export class Api extends HttpApi.make("todo-api")
  .add(TodosApi)
  .annotateMerge(OpenApi.annotations({
    title: "Todo API"
  })) {}
