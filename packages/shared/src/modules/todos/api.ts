import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { InternalServerError } from "../../errors"
import { Authorization } from "../auth"
import { CreateTodoInput, UpdateTodoInput } from "./contract"
import { TodoNotFound } from "./errors"
import { Todo, TodoId } from "./schema"

export class TodosApi extends HttpApiGroup.make("todos")
  .add(
    HttpApiEndpoint.get("list", "/todos", {
      success: Schema.Array(Todo),
      error: InternalServerError,
    }),
    HttpApiEndpoint.get("getById", "/todos/:id", {
      params: {
        id: TodoId,
      },
      success: Todo,
      error: Schema.Union([TodoNotFound, InternalServerError]),
    }),
    HttpApiEndpoint.post("create", "/todos", {
      payload: CreateTodoInput,
      success: Todo,
      error: InternalServerError,
    }),
    HttpApiEndpoint.patch("update", "/todos/:id", {
      params: {
        id: TodoId,
      },
      payload: UpdateTodoInput,
      success: Todo,
      error: Schema.Union([TodoNotFound, InternalServerError]),
    }),
  )
  .middleware(Authorization)
  .annotateMerge(
    OpenApi.annotations({
      title: "Todos",
      description: "Todo list endpoints",
    }),
  ) {}
