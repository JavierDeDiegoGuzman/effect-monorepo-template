import { HttpApi, OpenApi } from "effect/unstable/httpapi"
import { AuthApi, SessionApi } from "./modules/auth"
import { ProjectsApi } from "./modules/projects"
import { SystemApi } from "./modules/system"
import { TodosApi } from "./modules/todos"

export class Api extends HttpApi.make("todo-api")
  .add(SystemApi)
  .add(AuthApi)
  .add(SessionApi)
  .add(TodosApi)
  .add(ProjectsApi)
  .annotateMerge(
    OpenApi.annotations({
      title: "Template API",
    }),
  ) {}
