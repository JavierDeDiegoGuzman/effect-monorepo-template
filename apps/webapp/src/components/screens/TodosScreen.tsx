import { CreateTodoInput, type Todo, UpdateTodoInput } from "@app/shared"
import { useAtom, useAtomValue } from "@effect/atom-react"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import * as React from "react"
import { projectsQuery } from "@/atoms/projects"
import { createTodoAction, todosQuery, updateTodoAction } from "@/atoms/todos"
import { TodoCreateForm } from "@/components/domain/todos/TodoCreateForm"
import {
  renderTodoProjectMeta,
  TodoList,
} from "@/components/domain/todos/TodoList"
import { Screen } from "@/components/patterns/Screen"
import { toErrorMessage } from "@/lib/errors"

export function TodosScreen() {
  const todosState = useAtomValue(todosQuery)
  const projectsState = useAtomValue(projectsQuery)
  const [createTodoState, createTodo] = useAtom(createTodoAction, {
    mode: "promise",
  })
  const [updateTodoState, updateTodo] = useAtom(updateTodoAction, {
    mode: "promise",
  })
  const [title, setTitle] = React.useState("")
  const [projectId, setProjectId] = React.useState("none")
  const [pending, startTransition] = React.useTransition()

  const onToggle = (todo: Todo) => {
    startTransition(() => {
      void updateTodo({
        id: todo.id,
        input: new UpdateTodoInput({ completed: !todo.completed }),
      })
    })
  }

  return AsyncResult.matchWithError(projectsState, {
    onInitial: () => <TodosScreenLoading />,
    onError: (error) => <TodosScreenError message={toErrorMessage(error)} />,
    onDefect: (defect) => <TodosScreenError message={toErrorMessage(defect)} />,
    onSuccess: ({ value: projects }) => {
      const projectOptions = projects.map((project) => ({
        value: String(project.id),
        label: `${project.name}${project.archived ? " (archived)" : ""}`,
      }))
      const projectById = new Map(
        projects.map((project) => [project.id, project]),
      )

      const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const nextTitle = title.trim()
        if (nextTitle.length === 0) {
          return
        }

        startTransition(() => {
          void createTodo(
            new CreateTodoInput({
              title: nextTitle,
              projectId: projectId === "none" ? null : Number(projectId),
            }),
          ).then(() => {
            setTitle("")
            setProjectId("none")
          })
        })
      }

      return AsyncResult.matchWithError(todosState, {
        onInitial: () => <TodosScreenLoading />,
        onError: (error) => (
          <TodosScreenError message={toErrorMessage(error)} />
        ),
        onDefect: (defect) => (
          <TodosScreenError message={toErrorMessage(defect)} />
        ),
        onSuccess: ({ value: todos }) => (
          <Screen.Root>
            <Screen.Header>
              <Screen.Title>Todos</Screen.Title>
              <Screen.Description>
                A collection screen for the todos that belong to your current
                workspace.
              </Screen.Description>
            </Screen.Header>

            <Screen.Body>
              <Screen.Section>
                <Screen.SectionHeader>
                  <Screen.SectionTitle>Add todo</Screen.SectionTitle>
                  <Screen.SectionDescription>
                    Create a task in the current workspace and optionally assign
                    it to a project.
                  </Screen.SectionDescription>
                </Screen.SectionHeader>
                <TodoCreateForm
                  title={title}
                  projectId={projectId}
                  projectOptions={projectOptions}
                  pending={pending}
                  onTitleChange={setTitle}
                  onProjectChange={setProjectId}
                  onSubmit={onSubmit}
                />
                {AsyncResult.matchWithError(createTodoState, {
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
                  <Screen.SectionTitle>All todos</Screen.SectionTitle>
                  <Screen.SectionDescription>
                    Each task belongs to the current workspace and can
                    optionally belong to a project.
                  </Screen.SectionDescription>
                </Screen.SectionHeader>
                {AsyncResult.matchWithError(updateTodoState, {
                  onInitial: () => null,
                  onError: (error) => (
                    <Screen.Error>{toErrorMessage(error)}</Screen.Error>
                  ),
                  onDefect: (defect) => (
                    <Screen.Error>{toErrorMessage(defect)}</Screen.Error>
                  ),
                  onSuccess: () => null,
                })}
                {todos.length === 0 ? (
                  <Screen.Empty>No todos yet.</Screen.Empty>
                ) : (
                  <TodoList
                    todos={todos}
                    onToggle={onToggle}
                    renderMeta={renderTodoProjectMeta(projectById)}
                  />
                )}
              </Screen.Section>
            </Screen.Body>
          </Screen.Root>
        ),
      })
    },
  })
}

function TodosScreenLoading() {
  return (
    <Screen.Root>
      <Screen.Header>
        <Screen.Title>Todos</Screen.Title>
        <Screen.Description>Loading todos collection...</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Loading>Loading todos...</Screen.Loading>
      </Screen.Body>
    </Screen.Root>
  )
}

function TodosScreenError({ message }: { readonly message: string }) {
  return (
    <Screen.Root>
      <Screen.Header>
        <Screen.Title>Todos</Screen.Title>
        <Screen.Description>Todos collection screen.</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Error>{message}</Screen.Error>
      </Screen.Body>
    </Screen.Root>
  )
}
