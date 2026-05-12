import { LoginInput } from "@app/shared"
import { useAtom } from "@effect/atom-react"
import { Link } from "@tanstack/react-router"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import * as React from "react"
import { loginAction } from "@/features/auth/atoms"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { Screen } from "@/components/patterns/Screen"
import { Button } from "@/components/ui/button"
import { toErrorMessage } from "@/lib/errors"
import { pathForRoute } from "@/lib/router"

export function LoginScreen() {
  const [loginState, login] = useAtom(loginAction, { mode: "promise" })
  const [email, setEmail] = React.useState("alice@example.com")
  const [password, setPassword] = React.useState("alice")
  const [pending, startTransition] = React.useTransition()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    startTransition(() => {
      void login(new LoginInput({ email: email.trim(), password }))
    })
  }

  return (
    <Screen.Root className="mx-auto max-w-lg">
      <Screen.Header>
        <Screen.Title>Sign in</Screen.Title>
        <Screen.Description>
          Access your account and continue working on projects and todos.
        </Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Section>
          <LoginForm
            email={email}
            password={password}
            pending={pending}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={onSubmit}
          />
          {AsyncResult.matchWithError(loginState, {
            onInitial: () => null,
            onError: (error) => (
              <Screen.Error>{toErrorMessage(error)}</Screen.Error>
            ),
            onDefect: (defect) => (
              <Screen.Error>{toErrorMessage(defect)}</Screen.Error>
            ),
            onSuccess: () => null,
          })}
        </Screen.Section>

        <Screen.SectionDivider />

        <Screen.Section>
          <Screen.SectionHeader>
            <Screen.SectionTitle>New here?</Screen.SectionTitle>
            <Screen.SectionDescription>
              Creating an account lets you start tracking projects and todos.
            </Screen.SectionDescription>
          </Screen.SectionHeader>
          <Button asChild variant="outline">
            <Link to={pathForRoute({ name: "register" })}>Create account</Link>
          </Button>
        </Screen.Section>
      </Screen.Body>
    </Screen.Root>
  )
}
