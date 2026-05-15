import { Loader2 } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TodoCreateForm(props: {
  readonly title: string
  readonly pending: boolean
  readonly titleLabel?: string
  readonly submitLabel?: string
  readonly onTitleChange: (value: string) => void
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const titleLabel = props.titleLabel ?? "Todo title"
  const submitLabel = props.submitLabel ?? "Add todo"
  const titleId = React.useId()

  return (
    <form onSubmit={props.onSubmit} className="grid gap-3">
      <div className="grid gap-2">
        <label htmlFor={titleId} className="text-sm font-medium">
          {titleLabel}
        </label>
        <Input
          id={titleId}
          value={props.title}
          onChange={(event) => props.onTitleChange(event.target.value)}
          placeholder="Write the next task"
        />
      </div>

      <Button type="submit" disabled={props.pending}>
        {props.pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </form>
  )
}
