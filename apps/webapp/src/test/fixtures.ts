import {
  CurrentSession,
  makeTodoId,
  makeUserId,
  type Todo,
  User,
} from "@app/shared"

const userId = makeUserId("00000000-0000-4000-8000-000000000001")

export const sessionFixtures = {
  ada: new CurrentSession({
    user: new User({
      id: userId,
      name: "Ada Lovelace",
      email: "ada@example.com",
    }),
  }),
  longIdentity: new CurrentSession({
    user: new User({
      id: userId,
      name: "Alexandra Catherine Product-Operations-Lovelace",
      email: "alexandra.catherine.product.operations@example.enterprise.test",
    }),
  }),
}

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
