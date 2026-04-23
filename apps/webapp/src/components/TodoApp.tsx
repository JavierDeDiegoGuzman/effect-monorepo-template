import { CreateTodoInput, type Todo, UpdateTodoInput } from "@app/shared"
import { useAtomSet, useAtomSuspense } from "@effect/atom-react"
import { Loader2 } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { createTodoAtom, todosAtom, updateTodoAtom } from "../atoms/todos"

export function TodoApp() {
  const todos = useAtomSuspense(todosAtom).value
  const createTodo = useAtomSet(createTodoAtom, { mode: "promise" })
  const updateTodo = useAtomSet(updateTodoAtom, { mode: "promise" })
  const [title, setTitle] = React.useState("")
  const [pending, startTransition] = React.useTransition()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextTitle = title.trim()
    if (nextTitle.length === 0) {
      return
    }

    startTransition(() => {
      void createTodo(new CreateTodoInput({ title: nextTitle })).then(() => {
        setTitle("")
      })
    })
  }

  const onToggle = (todo: Todo) => {
    startTransition(() => {
      void updateTodo({
        id: todo.id,
        input: new UpdateTodoInput({ completed: !todo.completed }),
      })
    })
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.18),_transparent_32%),linear-gradient(180deg,_hsl(222_47%_11%),_hsl(224_71%_4%))] px-4 py-10 text-foreground sm:px-6">
      <Card className="mx-auto max-w-2xl border-border/60 bg-card/85 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
            Effect v4 beta
          </p>
          <CardTitle className="text-4xl">Todo List</CardTitle>
          <CardDescription className="max-w-xl text-sm leading-6 sm:text-base">
            API compartida en{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              shared
            </code>
            , server en{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              apps/server
            </code>{" "}
            y React conectado con atoms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            onSubmit={onSubmit}
            className="grid gap-3 sm:grid-cols-[1fr_auto]"
          >
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Write the next task"
            />
            <Button type="submit" disabled={pending} className="sm:min-w-28">
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Add
            </Button>
          </form>

          <ul className="grid gap-3">
            {todos.map((todo) => (
              <li key={todo.id}>
                <button
                  type="button"
                  onClick={() => onToggle(todo)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-muted/35 px-4 py-3 text-left transition-colors hover:bg-muted/55"
                >
                  <Checkbox
                    checked={todo.completed}
                    className="pointer-events-none"
                  />
                  <span
                    className={cn(
                      "text-sm sm:text-base",
                      todo.completed && "text-muted-foreground line-through",
                    )}
                  >
                    {todo.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
