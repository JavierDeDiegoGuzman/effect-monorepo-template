import { Schema } from "effect"
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "effect/unstable/httpapi"
import { Authorization } from "../auth"
import { CreateTodoInput, UpdateTodoInput } from "./contract"
import { TodoNotFound } from "./errors"
import { Todo } from "./schema"

export class TodosApi extends HttpApiGroup.make("todos")
  .add(
    HttpApiEndpoint.get("list", "/todos", {
      success: Schema.Array(Todo),
    }),
    HttpApiEndpoint.get("getById", "/todos/:id", {
      params: {
        id: Schema.NumberFromString,
      },
      success: Todo,
      error: TodoNotFound.pipe(
        HttpApiSchema.asNoContent({
          decode: () => new TodoNotFound({ id: -1 }),
        }),
      ),
    }),
    HttpApiEndpoint.post("create", "/todos", {
      payload: CreateTodoInput,
      success: Todo,
    }),
    HttpApiEndpoint.patch("update", "/todos/:id", {
      params: {
        id: Schema.NumberFromString,
      },
      payload: UpdateTodoInput,
      success: Todo,
      error: TodoNotFound.pipe(
        HttpApiSchema.asNoContent({
          decode: () => new TodoNotFound({ id: -1 }),
        }),
      ),
    }),
  )
  .middleware(Authorization)
  .annotateMerge(
    OpenApi.annotations({
      title: "Todos",
      description: "Todo list endpoints",
    }),
  ) {}
