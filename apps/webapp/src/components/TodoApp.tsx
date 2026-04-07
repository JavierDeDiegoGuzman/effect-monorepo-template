import { CreateTodoInput, Todo, UpdateTodoInput } from "@app/shared"
import { useAtomSet, useAtomSuspense } from "@effect/atom-react"
import * as React from "react"
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
        input: new UpdateTodoInput({ completed: !todo.completed })
      })
    })
  }

  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <p style={styles.eyebrow}>Effect v4 beta</p>
        <h1 style={styles.title}>Todo List</h1>
        <p style={styles.subtitle}>API compartida en `shared`, server en `apps/server` y React conectado con atoms.</p>

        <form onSubmit={onSubmit} style={styles.form}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write the next task"
            style={styles.input}
          />
          <button type="submit" disabled={pending} style={styles.button}>
            Add
          </button>
        </form>

        <ul style={styles.list}>
          {todos.map((todo) => (
            <li key={todo.id} style={styles.item}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => onToggle(todo)}
                />
                <span style={{ ...styles.todoText, ...(todo.completed ? styles.todoDone : undefined) }}>
                  {todo.title}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    margin: 0,
    padding: "24px",
    background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
    color: "#e5e7eb",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
  },
  panel: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "32px",
    borderRadius: "24px",
    background: "rgba(15, 23, 42, 0.82)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.35)"
  },
  eyebrow: {
    margin: 0,
    color: "#38bdf8",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontSize: "12px"
  },
  title: {
    margin: "12px 0 8px",
    fontSize: "40px",
    lineHeight: 1
  },
  subtitle: {
    margin: "0 0 24px",
    color: "#94a3b8",
    lineHeight: 1.5
  },
  form: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "12px"
  },
  input: {
    borderRadius: "14px",
    border: "1px solid #334155",
    background: "#020617",
    color: "#e5e7eb",
    padding: "14px 16px",
    fontSize: "16px"
  },
  button: {
    border: 0,
    borderRadius: "14px",
    background: "#22c55e",
    color: "#052e16",
    padding: "14px 18px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer"
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: "20px 0 0",
    display: "grid",
    gap: "12px"
  },
  item: {
    padding: "14px 16px",
    borderRadius: "16px",
    background: "rgba(15, 23, 42, 0.75)",
    border: "1px solid rgba(100, 116, 139, 0.3)"
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  todoText: {
    fontSize: "16px"
  },
  todoDone: {
    textDecoration: "line-through",
    color: "#64748b"
  }
}
