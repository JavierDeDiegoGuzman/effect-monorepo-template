import { CreateTodoInput, type Todo, UpdateTodoInput } from "@app/shared"
import { useAtom, useAtomValue } from "@effect/atom-react"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import * as React from "react"
import { Link } from "wouter"
import { projectsQuery } from "@/atoms/projects"
import { createTodoAction, todosQuery, updateTodoAction } from "@/atoms/todos"
import { ProjectSummary } from "@/components/domain/projects/ProjectSummary"
import { ProjectTodoList } from "@/components/domain/projects/ProjectTodoList"
import { TodoCreateForm } from "@/components/domain/todos/TodoCreateForm"
import { Screen } from "@/components/patterns/Screen"
import { Button } from "@/components/ui/button"
import { toErrorMessage } from "@/lib/errors"
import { pathForRoute } from "@/lib/router"

export function ProjectScreen({ projectId }: { readonly projectId: number }) {
  const projectsState = useAtomValue(projectsQuery)
  const todosState = useAtomValue(todosQuery)
  const [createTodoState, createTodo] = useAtom(createTodoAction, {
    mode: "promise",
  })
  const [updateTodoState, updateTodo] = useAtom(updateTodoAction, {
    mode: "promise",
  })
  const [title, setTitle] = React.useState("")
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
    onInitial: () => <ProjectScreenLoading />,
    onError: (error) => <ProjectScreenError message={toErrorMessage(error)} />,
    onDefect: (defect) => (
      <ProjectScreenError message={toErrorMessage(defect)} />
    ),
    onSuccess: ({ value: projects }) => {
      const project = projects.find((candidate) => candidate.id === projectId)

      if (project === undefined) {
        return (
          <Screen.Root>
            <Screen.Header>
              <Screen.Title>Project not found</Screen.Title>
              <Screen.Description>
                The requested project does not exist in the current workspace.
              </Screen.Description>
            </Screen.Header>
            <Screen.Body>
              <Screen.Empty>
                <div className="flex flex-wrap items-center gap-3">
                  <span>
                    Go back to the projects collection to pick another project.
                  </span>
                  <Button asChild variant="outline">
                    <Link href={pathForRoute({ name: "projects" })}>
                      Back to projects
                    </Link>
                  </Button>
                </div>
              </Screen.Empty>
            </Screen.Body>
          </Screen.Root>
        )
      }

      const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const nextTitle = title.trim()
        if (nextTitle.length === 0 || project.archived) {
          return
        }

        startTransition(() => {
          void createTodo(
            new CreateTodoInput({
              title: nextTitle,
              projectId: project.id,
            }),
          ).then(() => {
            setTitle("")
          })
        })
      }

      return AsyncResult.matchWithError(todosState, {
        onInitial: () => <ProjectScreenLoading />,
        onError: (error) => (
          <ProjectScreenError message={toErrorMessage(error)} />
        ),
        onDefect: (defect) => (
          <ProjectScreenError message={toErrorMessage(defect)} />
        ),
        onSuccess: ({ value: todos }) => {
          const projectTodos = todos.filter(
            (todo) => todo.projectId === project.id,
          )
          const completedTodos = projectTodos.filter(
            (todo) => todo.completed,
          ).length

          return (
            <Screen.Root>
              <ProjectSummary
                name={project.name}
                description={project.description}
                archived={project.archived}
                todoCount={projectTodos.length}
                completedCount={completedTodos}
              />

              <Screen.Body>
                <Screen.Section>
                  <Screen.SectionHeader>
                    <Screen.SectionTitle>Add todo</Screen.SectionTitle>
                    <Screen.SectionDescription>
                      This page is dedicated to one workspace project and its
                      tasks.
                    </Screen.SectionDescription>
                  </Screen.SectionHeader>
                  <TodoCreateForm
                    title={title}
                    projectId="none"
                    projectOptions={[]}
                    pending={pending}
                    titleLabel="Todo title"
                    submitLabel="Add todo to project"
                    disableProjectSelect
                    onTitleChange={setTitle}
                    onProjectChange={() => undefined}
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
                    <Screen.SectionTitle>Project todos</Screen.SectionTitle>
                    <Screen.SectionDescription>
                      A full task view for this project within the current
                      workspace.
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
                  {projectTodos.length === 0 ? (
                    <Screen.Empty>No todos in this project yet.</Screen.Empty>
                  ) : (
                    <ProjectTodoList todos={projectTodos} onToggle={onToggle} />
                  )}
                </Screen.Section>
              </Screen.Body>
            </Screen.Root>
          )
        },
      })
    },
  })
}

function ProjectScreenLoading() {
  return (
    <Screen.Root>
      <Screen.Header>
        <Screen.Title>Project</Screen.Title>
        <Screen.Description>Loading project details...</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Loading>Loading project...</Screen.Loading>
      </Screen.Body>
    </Screen.Root>
  )
}

function ProjectScreenError({ message }: { readonly message: string }) {
  return (
    <Screen.Root>
      <Screen.Header>
        <Screen.Title>Project</Screen.Title>
        <Screen.Description>Project detail screen.</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Error>{message}</Screen.Error>
      </Screen.Body>
    </Screen.Root>
  )
}
