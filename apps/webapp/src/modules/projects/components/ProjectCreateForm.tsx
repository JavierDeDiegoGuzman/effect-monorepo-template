import { Loader2 } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ProjectCreateForm(props: {
  readonly name: string
  readonly description: string
  readonly pending: boolean
  readonly onNameChange: (value: string) => void
  readonly onDescriptionChange: (value: string) => void
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const nameId = React.useId()
  const descriptionId = React.useId()

  return (
    <form onSubmit={props.onSubmit} className="grid gap-3">
      <div className="grid gap-2">
        <label htmlFor={nameId} className="text-sm font-medium">
          Project name
        </label>
        <Input
          id={nameId}
          value={props.name}
          onChange={(event) => props.onNameChange(event.target.value)}
          placeholder="Project name"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor={descriptionId} className="text-sm font-medium">
          Description
        </label>
        <Input
          id={descriptionId}
          value={props.description}
          onChange={(event) => props.onDescriptionChange(event.target.value)}
          placeholder="Description"
        />
      </div>
      <Button type="submit" disabled={props.pending}>
        {props.pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Add project
      </Button>
    </form>
  )
}
