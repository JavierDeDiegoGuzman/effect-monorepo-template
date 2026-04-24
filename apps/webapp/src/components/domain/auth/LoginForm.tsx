import { Loader2 } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LoginForm(props: {
  readonly email: string
  readonly password: string
  readonly pending: boolean
  readonly onEmailChange: (value: string) => void
  readonly onPasswordChange: (value: string) => void
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const emailId = React.useId()
  const passwordId = React.useId()

  return (
    <form onSubmit={props.onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor={emailId} className="text-sm font-medium">
          Email
        </label>
        <Input
          id={emailId}
          type="email"
          autoComplete="email"
          value={props.email}
          onChange={(event) => props.onEmailChange(event.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor={passwordId} className="text-sm font-medium">
          Password
        </label>
        <Input
          id={passwordId}
          type="password"
          autoComplete="current-password"
          value={props.password}
          onChange={(event) => props.onPasswordChange(event.target.value)}
          placeholder="Enter your password"
        />
      </div>

      <Button type="submit" disabled={props.pending}>
        {props.pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Sign in
      </Button>
    </form>
  )
}
