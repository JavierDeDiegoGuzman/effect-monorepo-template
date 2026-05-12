import { CreateProjectInput, type Project } from "@app/shared"
import { useAtom, useAtomValue } from "@effect/atom-react"
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult"
import * as React from "react"
import {
  archiveProjectAction,
  createProjectAction,
  projectsQuery,
} from "@/atoms/projects"
import { ProjectCreateForm } from "@/components/domain/projects/ProjectCreateForm"
import { ProjectList } from "@/components/domain/projects/ProjectList"
import { Screen } from "@/components/patterns/Screen"
import { toErrorMessage } from "@/lib/errors"

export function ProjectsScreen() {
  const projectsState = useAtomValue(projectsQuery)
  const [createProjectState, createProject] = useAtom(createProjectAction, {
    mode: "promise",
  })
  const [archiveProjectState, archiveProject] = useAtom(archiveProjectAction, {
    mode: "promise",
  })
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [pending, startTransition] = React.useTransition()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextName = name.trim()
    if (nextName.length === 0) {
      return
    }

    startTransition(() => {
      void createProject(
        new CreateProjectInput({
          name: nextName,
          description: description.trim(),
        }),
      ).then(() => {
        setName("")
        setDescription("")
      })
    })
  }

  const onArchive = (project: Project) => {
    if (project.archived) {
      return
    }

    startTransition(() => {
      void archiveProject(project.id)
    })
  }

  return AsyncResult.matchWithError(projectsState, {
    onInitial: () => <ProjectsScreenLoading />,
    onError: (error) => <ProjectsScreenError message={toErrorMessage(error)} />,
    onDefect: (defect) => (
      <ProjectsScreenError message={toErrorMessage(defect)} />
    ),
    onSuccess: ({ value: projects }) => (
      <Screen.Root>
        <Screen.Header>
          <Screen.Title>Projects</Screen.Title>
          <Screen.Description>
            A collection screen for the projects that belong to your current
            account.
          </Screen.Description>
        </Screen.Header>

        <Screen.Body>
          <Screen.Section>
            <Screen.SectionHeader>
              <Screen.SectionTitle>Add project</Screen.SectionTitle>
              <Screen.SectionDescription>
                Create a new project for your account.
              </Screen.SectionDescription>
            </Screen.SectionHeader>
            <ProjectCreateForm
              name={name}
              description={description}
              pending={pending}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onSubmit={onSubmit}
            />
            {AsyncResult.matchWithError(createProjectState, {
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
              <Screen.SectionTitle>All projects</Screen.SectionTitle>
              <Screen.SectionDescription>
                Manage the project collection here and jump into each project
                detail.
              </Screen.SectionDescription>
            </Screen.SectionHeader>
            {AsyncResult.matchWithError(archiveProjectState, {
              onInitial: () => null,
              onError: (error) => (
                <Screen.Error>{toErrorMessage(error)}</Screen.Error>
              ),
              onDefect: (defect) => (
                <Screen.Error>{toErrorMessage(defect)}</Screen.Error>
              ),
              onSuccess: () => null,
            })}
            {projects.length === 0 ? (
              <Screen.Empty>No projects yet.</Screen.Empty>
            ) : (
              <ProjectList
                projects={projects}
                pending={pending}
                onArchive={onArchive}
              />
            )}
          </Screen.Section>
        </Screen.Body>
      </Screen.Root>
    ),
  })
}

function ProjectsScreenLoading() {
  return (
    <Screen.Root>
      <Screen.Header>
        <Screen.Title>Projects</Screen.Title>
        <Screen.Description>Loading projects collection...</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Loading>Loading projects...</Screen.Loading>
      </Screen.Body>
    </Screen.Root>
  )
}

function ProjectsScreenError({ message }: { readonly message: string }) {
  return (
    <Screen.Root>
      <Screen.Header>
        <Screen.Title>Projects</Screen.Title>
        <Screen.Description>Projects collection screen.</Screen.Description>
      </Screen.Header>
      <Screen.Body>
        <Screen.Error>{message}</Screen.Error>
      </Screen.Body>
    </Screen.Root>
  )
}
