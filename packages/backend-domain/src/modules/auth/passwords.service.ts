import { Context, type Effect } from "effect"

export class Passwords extends Context.Service<
  Passwords,
  {
    readonly hash: (password: string) => Effect.Effect<string>
    readonly verify: (password: string, hash: string) => Effect.Effect<boolean>
  }
>()("app/Passwords") {}
