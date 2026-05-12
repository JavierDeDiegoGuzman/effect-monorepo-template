import { Effect, ServiceMap } from "effect"

export class Passwords extends ServiceMap.Service<
  Passwords,
  {
    readonly hash: (password: string) => Effect.Effect<string>
    readonly verify: (password: string, hash: string) => Effect.Effect<boolean>
  }
>()("app/Passwords") {}
