import { makeTodoId, makeUserId, type Todo } from "@app/shared"

const userId = makeUserId("00000000-0000-4000-8000-000000000001")

export const todoFixtures = {
  open: {
    id: makeTodoId("00000000-0000-4000-8000-000000000201"),
    userId,
    title: "Draft the launch email",
    completed: false,
  },
  completed: {
    id: makeTodoId("00000000-0000-4000-8000-000000000202"),
    userId,
    title: "Create the QA checklist",
    completed: true,
  },
} satisfies Record<string, Todo>
