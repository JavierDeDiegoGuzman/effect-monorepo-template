import { Loader2 } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function TodoCreateForm(props: {
  readonly title: string
  readonly projectId: string
  readonly projectOptions: ReadonlyArray<{
    readonly value: string
    readonly label: string
  }>
  readonly pending: boolean
  readonly titleLabel?: string
  readonly submitLabel?: string
  readonly disableProjectSelect?: boolean
  readonly onTitleChange: (value: string) => void
  readonly onProjectChange: (value: string) => void
  readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const titleLabel = props.titleLabel ?? "Todo title"
  const submitLabel = props.submitLabel ?? "Add todo"
  const titleId = React.useId()
  const projectLabelId = React.useId()

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

      <div className="grid gap-2">
        <span id={projectLabelId} className="text-sm font-medium">
          Project
        </span>
        <Select
          value={props.projectId}
          onValueChange={props.onProjectChange}
          disabled={props.disableProjectSelect}
        >
          <SelectTrigger className="w-full" aria-labelledby={projectLabelId}>
            <SelectValue placeholder="No project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No project</SelectItem>
            {props.projectOptions.map((project) => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={props.pending}>
        {props.pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </form>
  )
}
