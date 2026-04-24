import type { Todo } from "@app/shared"
import { TodoList } from "@/components/domain/todos/TodoList"

export function ProjectTodoList(props: {
  readonly todos: ReadonlyArray<Todo>
  readonly onToggle: (todo: Todo) => void
}) {
  return <TodoList todos={props.todos} onToggle={props.onToggle} />
}
