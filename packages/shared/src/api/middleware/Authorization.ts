import { Schema, ServiceMap } from "effect"
import { HttpApiMiddleware, HttpApiSecurity } from "effect/unstable/httpapi"
import { User } from "../../domain/User"
import { Workspace } from "../../domain/Workspace"

export class CurrentUser extends ServiceMap.Service<CurrentUser, User>()(
  "app/Authorization/CurrentUser",
) {}

export class CurrentWorkspace extends ServiceMap.Service<CurrentWorkspace, Workspace>()(
  "app/Authorization/CurrentWorkspace",
) {}

export class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  {
    message: Schema.String,
  },
  { httpApiStatus: 401 },
) {}

export class Authorization extends HttpApiMiddleware.Service<Authorization, {
  provides: CurrentUser | CurrentWorkspace
  requires: never
}>()("app/Authorization", {
  requiredForClient: true,
  security: {
    bearer: HttpApiSecurity.bearer,
  },
  error: Unauthorized,
}) {}
