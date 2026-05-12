import { Loader2 } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function RegisterForm(props: {
  readonly name: string
  readonly email: string
  readonly password: string
  readonly pending: boolean
  readonly onNameChange: (value: string) => void
  readonly onEmailChange: (value: string) => void
  readonly onPasswordChange: (value: string) => void
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const nameId = React.useId()
  const emailId = React.useId()
  const passwordId = React.useId()

  return (
    <form onSubmit={props.onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor={nameId} className="text-sm font-medium">
          Name
        </label>
        <Input
          id={nameId}
          autoComplete="name"
          value={props.name}
          onChange={(event) => props.onNameChange(event.target.value)}
          placeholder="Your name"
        />
      </div>

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
          autoComplete="new-password"
          value={props.password}
          onChange={(event) => props.onPasswordChange(event.target.value)}
          placeholder="Choose a password"
        />
      </div>

      <Button type="submit" disabled={props.pending}>
        {props.pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Create account
      </Button>
    </form>
  )
}
