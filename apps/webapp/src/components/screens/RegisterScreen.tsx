import { RegisterInput } from "@app/shared"
import { useAtom } from "@effect/atom-react"
import { Link } from "@tanstack/react-router"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import * as React from "react"
import { Screen } from "@/components/patterns/Screen"
import { Button } from "@/components/ui/button"
import { registerAction } from "@/features/auth/atoms"
import { RegisterForm } from "@/features/auth/components/RegisterForm"
import { toErrorMessage } from "@/lib/errors"
import { pathForRoute } from "@/lib/router"

export function RegisterScreen() {
  const [registerState, register] = useAtom(registerAction, { mode: "promise" })
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [pending, startTransition] = React.useTransition()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextName = name.trim()
    const nextEmail = email.trim()
    if (
      nextName.length === 0 ||
      nextEmail.length === 0 ||
      password.length === 0
    ) {
      return
    }

    startTransition(() => {
      void register(
        new RegisterInput({ name: nextName, email: nextEmail, password }),
      )
    })
  }

  return (
    <Screen.Root className="mx-auto max-w-lg">
      <Screen.Header>
        <Screen.Title>Create account</Screen.Title>
        <Screen.Description>
          Create your account so you can start organizing work immediately.
        </Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Section>
          <RegisterForm
            name={name}
            email={email}
            password={password}
            pending={pending}
            onNameChange={setName}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={onSubmit}
          />
          {AsyncResult.matchWithError(registerState, {
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
            <Screen.SectionTitle>Already have an account?</Screen.SectionTitle>
            <Screen.SectionDescription>
              Sign in with your existing credentials.
            </Screen.SectionDescription>
          </Screen.SectionHeader>
          <Button asChild variant="outline">
            <Link to={pathForRoute({ name: "login" })}>Back to sign in</Link>
          </Button>
        </Screen.Section>
      </Screen.Body>
    </Screen.Root>
  )
}
