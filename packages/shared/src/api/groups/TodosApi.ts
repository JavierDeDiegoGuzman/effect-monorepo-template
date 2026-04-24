import { Schema } from "effect"
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "effect/unstable/httpapi"
import { ProjectNotFound } from "../../domain/ProjectErrors"
import { CreateTodoInput, Todo, UpdateTodoInput } from "../../domain/Todo"
import { TodoNotFound } from "../../domain/TodoErrors"
import { Authorization } from "../middleware/Authorization"

export class TodosApi extends HttpApiGroup.make("todos")
  .add(
    HttpApiEndpoint.get("list", "/todos", {
      success: Schema.Array(Todo),
    }),
    HttpApiEndpoint.get("listByProject", "/projects/:projectId/todos", {
      params: {
        projectId: Schema.NumberFromString,
      },
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
      error: ProjectNotFound.pipe(
        HttpApiSchema.asNoContent({
          decode: () => new ProjectNotFound({ id: -1 }),
        }),
      ),
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
