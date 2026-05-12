import type { Project, Todo } from "@app/shared"

export const projectFixtures = {
  active: {
    id: 101,
    userId: 1,
    name: "Launch checklist",
    description: "Coordinate the public launch work",
    archived: false,
  },
  archived: {
    id: 102,
    userId: 1,
    name: "Archived discovery",
    description: "Completed research track",
    archived: true,
  },
} satisfies Record<string, Project>

export const todoFixtures = {
  open: {
    id: 201,
    userId: 1,
    title: "Draft the launch email",
    completed: false,
    projectId: projectFixtures.active.id,
  },
  completed: {
    id: 202,
    userId: 1,
    title: "Create the QA checklist",
    completed: true,
    projectId: null,
  },
} satisfies Record<string, Todo>

export const projectOptions = Object.values(projectFixtures).map((project) => ({
  value: String(project.id),
  label: project.name,
}))
