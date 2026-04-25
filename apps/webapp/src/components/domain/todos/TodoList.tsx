import type { Project, Todo } from "@app/shared"
import type * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export function TodoList(props: {
  readonly todos: ReadonlyArray<Todo>
  readonly onToggle: (todo: Todo) => void
  readonly renderMeta?: (todo: Todo) => React.ReactNode
}) {
  return (
    <ul className="grid gap-3">
      {props.todos.map((todo) => (
        <TodoListItem
          key={todo.id}
          todo={todo}
          meta={props.renderMeta?.(todo)}
          onToggle={props.onToggle}
        />
      ))}
    </ul>
  )
}

export function renderTodoProjectMeta(
  projectById: ReadonlyMap<number, Project>,
) {
  return (todo: Todo) => {
    const project =
      todo.projectId === null ? null : (projectById.get(todo.projectId) ?? null)

    return (
      <p className="text-xs text-muted-foreground">
        {project === null
          ? "No project"
          : `Project: ${project.name}${project.archived ? " (archived)" : ""}`}
      </p>
    )
  }
}

function TodoListItem(props: {
  readonly todo: Todo
  readonly meta?: React.ReactNode
  readonly onToggle: (todo: Todo) => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => props.onToggle(props.todo)}
        aria-pressed={props.todo.completed}
        aria-label={`${props.todo.completed ? "Mark as incomplete" : "Mark as complete"}: ${props.todo.title}`}
        className="flex w-full items-center gap-3 rounded-lg border border-border/70 bg-background/70 px-4 py-3 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <Checkbox
          checked={props.todo.completed}
          className="pointer-events-none"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm sm:text-base",
              props.todo.completed && "text-muted-foreground line-through",
            )}
          >
            {props.todo.title}
          </p>
          {props.meta}
        </div>
      </button>
    </li>
  )
}
