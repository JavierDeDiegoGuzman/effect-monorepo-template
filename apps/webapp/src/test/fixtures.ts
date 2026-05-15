import type { Todo } from "@app/shared"

export const todoFixtures = {
  open: {
    id: 201,
    userId: 1,
    title: "Draft the launch email",
    completed: false,
  },
  completed: {
    id: 202,
    userId: 1,
    title: "Create the QA checklist",
    completed: true,
  },
} satisfies Record<string, Todo>
