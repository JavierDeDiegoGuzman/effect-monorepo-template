import { HttpApi, OpenApi } from "effect/unstable/httpapi"
import { ProjectsApi } from "./groups/ProjectsApi"
import { SystemApi } from "./groups/SystemApi"
import { TodosApi } from "./groups/TodosApi"

export class Api extends HttpApi.make("todo-api")
  .add(SystemApi)
  .add(TodosApi)
  .add(ProjectsApi)
  .annotateMerge(
    OpenApi.annotations({
      title: "Template API",
    }),
  ) {}
