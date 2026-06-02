import { Effect, Match, Schema as S } from "effect"
import { Command, Runtime } from "foldkit"
import { type Document, type Html, html } from "foldkit/html"
import { m } from "foldkit/message"
import "./styles/globals.css"
import { apiClientConfig } from "./api/config"
import { toErrorMessage } from "./lib/errors"

const User = S.Struct({
  id: S.String,
  email: S.String,
  name: S.String,
})

const CurrentSession = S.Struct({
  user: User,
})

type CurrentSession = typeof CurrentSession.Type

const Todo = S.Struct({
  id: S.String,
  userId: S.String,
  title: S.String,
  completed: S.Boolean,
})

type Todo = typeof Todo.Type

const Route = S.Literals(["/", "/login", "/register", "/todos"])
type Route = typeof Route.Type

export const Model = S.Struct({
  route: Route,
  session: S.NullOr(CurrentSession),
  todos: S.Array(Todo),
  loading: S.Boolean,
  pending: S.Boolean,
  error: S.NullOr(S.String),
  loginEmail: S.String,
  loginPassword: S.String,
  registerName: S.String,
  registerEmail: S.String,
  registerPassword: S.String,
  newTodoTitle: S.String,
})

export type Model = typeof Model.Type

const AppLoaded = m("AppLoaded", {
  session: S.NullOr(CurrentSession),
  todos: S.Array(Todo),
})
const ApiFailed = m("ApiFailed", { message: S.String })
const Navigate = m("Navigate", { route: Route })
const ChangedLoginEmail = m("ChangedLoginEmail", { value: S.String })
const ChangedLoginPassword = m("ChangedLoginPassword", { value: S.String })
const ChangedRegisterName = m("ChangedRegisterName", { value: S.String })
const ChangedRegisterEmail = m("ChangedRegisterEmail", { value: S.String })
const ChangedRegisterPassword = m("ChangedRegisterPassword", {
  value: S.String,
})
const ChangedNewTodoTitle = m("ChangedNewTodoTitle", { value: S.String })
const SubmittedLogin = m("SubmittedLogin")
const SubmittedRegister = m("SubmittedRegister")
const SubmittedLogout = m("SubmittedLogout")
const SubmittedTodo = m("SubmittedTodo")
const TodoToggled = m("TodoToggled", { id: S.String })
const Authenticated = m("Authenticated", { session: CurrentSession })
const LoggedOut = m("LoggedOut")
const TodosLoaded = m("TodosLoaded", { todos: S.Array(Todo) })

export const Message = S.Union([
  AppLoaded,
  ApiFailed,
  Navigate,
  ChangedLoginEmail,
  ChangedLoginPassword,
  ChangedRegisterName,
  ChangedRegisterEmail,
  ChangedRegisterPassword,
  ChangedNewTodoTitle,
  SubmittedLogin,
  SubmittedRegister,
  SubmittedLogout,
  SubmittedTodo,
  TodoToggled,
  Authenticated,
  LoggedOut,
  TodosLoaded,
])

export type Message = typeof Message.Type

type ProgramCommand = Command.Command<Message>

const LoadApp = Command.define(
  "LoadApp",
  AppLoaded,
  ApiFailed,
)(
  Effect.tryPromise({
    try: async () => {
      const session = await api.me()
      const todos = session === null ? [] : await api.listTodos()
      return AppLoaded({ session, todos })
    },
    catch: (error) => ApiFailed({ message: toErrorMessage(error) }),
  }).pipe(
    Effect.match({
      onFailure: (message) => message,
      onSuccess: (message) => message,
    }),
  ),
)

const Login = Command.define(
  "Login",
  { email: S.String, password: S.String },
  Authenticated,
  ApiFailed,
)((input) =>
  Effect.tryPromise({
    try: async () => Authenticated({ session: await api.login(input) }),
    catch: (error) => ApiFailed({ message: toErrorMessage(error) }),
  }).pipe(
    Effect.match({
      onFailure: (message) => message,
      onSuccess: (message) => message,
    }),
  ),
)

const Register = Command.define(
  "Register",
  { name: S.String, email: S.String, password: S.String },
  Authenticated,
  ApiFailed,
)((input) =>
  Effect.tryPromise({
    try: async () => Authenticated({ session: await api.register(input) }),
    catch: (error) => ApiFailed({ message: toErrorMessage(error) }),
  }).pipe(
    Effect.match({
      onFailure: (message) => message,
      onSuccess: (message) => message,
    }),
  ),
)

const Logout = Command.define(
  "Logout",
  LoggedOut,
  ApiFailed,
)(
  Effect.tryPromise({
    try: async () => {
      await api.logout()
      return LoggedOut()
    },
    catch: (error) => ApiFailed({ message: toErrorMessage(error) }),
  }).pipe(
    Effect.match({
      onFailure: (message) => message,
      onSuccess: (message) => message,
    }),
  ),
)

const CreateTodo = Command.define(
  "CreateTodo",
  { title: S.String },
  TodosLoaded,
  ApiFailed,
)((input) =>
  Effect.tryPromise({
    try: async () => {
      await api.createTodo(input)
      return TodosLoaded({ todos: await api.listTodos() })
    },
    catch: (error) => ApiFailed({ message: toErrorMessage(error) }),
  }).pipe(
    Effect.match({
      onFailure: (message) => message,
      onSuccess: (message) => message,
    }),
  ),
)

const ToggleTodo = Command.define(
  "ToggleTodo",
  { id: S.String, completed: S.Boolean },
  TodosLoaded,
  ApiFailed,
)((input) =>
  Effect.tryPromise({
    try: async () => {
      await api.updateTodo(input.id, { completed: !input.completed })
      return TodosLoaded({ todos: await api.listTodos() })
    },
    catch: (error) => ApiFailed({ message: toErrorMessage(error) }),
  }).pipe(
    Effect.match({
      onFailure: (message) => message,
      onSuccess: (message) => message,
    }),
  ),
)

export const init: Runtime.ProgramInit<Model, Message> = () => [
  {
    route: currentRoute(),
    session: null,
    todos: [],
    loading: true,
    pending: false,
    error: null,
    loginEmail: "",
    loginPassword: "",
    registerName: "",
    registerEmail: "",
    registerPassword: "",
    newTodoTitle: "",
  },
  [LoadApp()],
]

export const update = (
  model: Model,
  message: Message,
): readonly [Model, ReadonlyArray<ProgramCommand>] =>
  Match.value(message).pipe(
    Match.withReturnType<readonly [Model, ReadonlyArray<ProgramCommand>]>(),
    Match.tagsExhaustive({
      AppLoaded: ({ session, todos }) => {
        const route = guardedRoute(model.route, session)
        setHash(route)
        return [{ ...model, route, session, todos, loading: false }, []]
      },
      ApiFailed: ({ message }) => [
        { ...model, error: message, loading: false, pending: false },
        [],
      ],
      Navigate: ({ route }) => {
        const nextRoute = guardedRoute(route, model.session)
        setHash(nextRoute)
        return [{ ...model, route: nextRoute, error: null }, []]
      },
      ChangedLoginEmail: ({ value }) => [{ ...model, loginEmail: value }, []],
      ChangedLoginPassword: ({ value }) => [
        { ...model, loginPassword: value },
        [],
      ],
      ChangedRegisterName: ({ value }) => [
        { ...model, registerName: value },
        [],
      ],
      ChangedRegisterEmail: ({ value }) => [
        { ...model, registerEmail: value },
        [],
      ],
      ChangedRegisterPassword: ({ value }) => [
        { ...model, registerPassword: value },
        [],
      ],
      ChangedNewTodoTitle: ({ value }) => [
        { ...model, newTodoTitle: value },
        [],
      ],
      SubmittedLogin: () => [
        { ...model, pending: true, error: null },
        [
          Login({
            email: model.loginEmail,
            password: model.loginPassword,
          }),
        ],
      ],
      SubmittedRegister: () => [
        { ...model, pending: true, error: null },
        [
          Register({
            name: model.registerName,
            email: model.registerEmail,
            password: model.registerPassword,
          }),
        ],
      ],
      SubmittedLogout: () => [
        { ...model, pending: true, error: null },
        [Logout()],
      ],
      SubmittedTodo: () => {
        const title = model.newTodoTitle.trim()

        if (title.length === 0) {
          return [{ ...model, error: "Todo title is required" }, []]
        }

        return [
          { ...model, pending: true, error: null },
          [CreateTodo({ title })],
        ]
      },
      TodoToggled: ({ id }) => {
        const todo = model.todos.find((candidate) => candidate.id === id)
        return todo === undefined
          ? [model, []]
          : [
              { ...model, pending: true, error: null },
              [ToggleTodo({ id, completed: todo.completed })],
            ]
      },
      Authenticated: ({ session }) => {
        setHash("/")
        return [
          {
            ...model,
            route: "/",
            session,
            pending: false,
            error: null,
            loginPassword: "",
            registerPassword: "",
          },
          [LoadApp()],
        ]
      },
      LoggedOut: () => {
        setHash("/login")
        return [
          {
            ...model,
            route: "/login",
            session: null,
            todos: [],
            pending: false,
            error: null,
          },
          [],
        ]
      },
      TodosLoaded: ({ todos }) => [
        {
          ...model,
          todos,
          pending: false,
          error: null,
          newTodoTitle: "",
        },
        [],
      ],
    }),
  )

export const view = (model: Model): Document => {
  const title = titleForRoute(model.route)

  return {
    title,
    body: model.loading ? shell(model, loadingScreen()) : appView(model),
  }
}

const program = Runtime.makeProgram({
  Model,
  init,
  update,
  view,
  container: document.getElementById("root"),
  devTools: {
    Message,
  },
})

Runtime.run(program)

const h = html<Message>()

function appView(model: Model): Html {
  if (model.route === "/login") {
    return authLayout("Sign in", "Use your demo account to access todos.", [
      errorView(model.error),
      loginForm(model),
      authLink("No account?", "Create one", "/register"),
    ])
  }

  if (model.route === "/register") {
    return authLayout(
      "Create account",
      "Register a user and start tracking todos.",
      [
        errorView(model.error),
        registerForm(model),
        authLink("Already registered?", "Sign in", "/login"),
      ],
    )
  }

  if (model.route === "/todos") {
    return shell(
      model,
      screen(
        "Todos",
        "Create and complete work items for the active session.",
        [errorView(model.error), createTodoForm(model), todoList(model.todos)],
      ),
    )
  }

  return shell(
    model,
    screen("Dashboard", "A summary of your current scope.", [dashboard(model)]),
  )
}

function loadingScreen(): Html {
  return screen("Loading", "Preparing the app...", [
    h.p(
      [h.Class("rounded-xl border bg-card p-5 text-muted-foreground")],
      ["Loading..."],
    ),
  ])
}

function authLayout(
  title: string,
  description: string,
  body: ReadonlyArray<Html>,
): Html {
  return h.main(
    [
      h.Class(
        "flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12",
      ),
    ],
    [
      h.section(
        [h.Class("w-full max-w-md rounded-xl border bg-card p-6 shadow-sm")],
        [
          h.div(
            [h.Class("mb-6 grid gap-2")],
            [
              h.h1([h.Class("text-2xl font-semibold tracking-tight")], [title]),
              h.p([h.Class("text-sm text-muted-foreground")], [description]),
            ],
          ),
          h.div([h.Class("grid gap-4")], body),
        ],
      ),
    ],
  )
}

function shell(model: Model, body: Html): Html {
  return h.div(
    [h.Class("min-h-screen bg-background")],
    [
      h.header(
        [h.Class("border-b bg-card/70")],
        [
          h.div(
            [
              h.Class(
                "mx-auto flex max-w-5xl items-center justify-between px-4 py-4",
              ),
            ],
            [
              h.button(
                [
                  h.Class("font-semibold"),
                  h.Type("button"),
                  h.OnClick(Navigate({ route: "/" })),
                ],
                ["Effect Monorepo Template"],
              ),
              h.nav(
                [h.Class("flex items-center gap-2 text-sm")],
                [
                  navButton("/", "Dashboard", model.route),
                  navButton("/todos", "Todos", model.route),
                  h.button(
                    [
                      h.Class(
                        "rounded-md border px-3 py-2 hover:bg-accent disabled:opacity-50",
                      ),
                      h.Type("button"),
                      h.Disabled(model.pending),
                      h.OnClick(SubmittedLogout()),
                    ],
                    ["Logout"],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      h.main([h.Class("mx-auto max-w-5xl px-4 py-8")], [body]),
    ],
  )
}

function navButton(route: Route, label: string, activeRoute: Route): Html {
  const active =
    route === activeRoute
      ? "bg-primary text-primary-foreground"
      : "hover:bg-accent"
  return h.button(
    [
      h.Class(`rounded-md px-3 py-2 ${active}`),
      h.Type("button"),
      h.OnClick(Navigate({ route })),
    ],
    [label],
  )
}

function screen(
  title: string,
  description: string,
  body: ReadonlyArray<Html>,
): Html {
  return h.section(
    [h.Class("grid gap-6")],
    [
      h.header(
        [h.Class("grid gap-2")],
        [
          h.h1([h.Class("text-3xl font-semibold tracking-tight")], [title]),
          h.p([h.Class("text-muted-foreground")], [description]),
        ],
      ),
      h.div([h.Class("grid gap-4")], body),
    ],
  )
}

function dashboard(model: Model): Html {
  if (model.session === null) {
    return errorCard("No active session")
  }

  const open = model.todos.filter((todo) => !todo.completed).length
  const done = model.todos.length - open

  return h.div(
    [h.Class("grid gap-4")],
    [
      h.div(
        [h.Class("grid gap-4 md:grid-cols-3")],
        [
          statCard(
            "Signed in as",
            model.session.user.name,
            model.session.user.email,
          ),
          statCard("Open todos", String(open), "Items still in progress"),
          statCard("Completed", String(done), "Items already done"),
        ],
      ),
      h.section(
        [h.Class("rounded-xl border bg-card p-5")],
        [
          h.h2([h.Class("mb-3 text-lg font-medium")], ["Recent todos"]),
          model.todos.length === 0
            ? empty("No todos yet.")
            : todoList(model.todos.slice(0, 3)),
          h.p(
            [h.Class("mt-4")],
            [
              h.button(
                [
                  h.Class("text-sm underline"),
                  h.Type("button"),
                  h.OnClick(Navigate({ route: "/todos" })),
                ],
                ["Manage all todos"],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}

function statCard(label: string, value: string, description: string): Html {
  return h.article(
    [h.Class("rounded-xl border bg-card p-5")],
    [
      h.p([h.Class("text-sm text-muted-foreground")], [label]),
      h.p([h.Class("mt-2 text-2xl font-semibold")], [value]),
      h.p([h.Class("mt-1 text-sm text-muted-foreground")], [description]),
    ],
  )
}

function loginForm(model: Model): Html {
  return h.form(
    [h.Class("grid gap-4"), h.OnSubmit(SubmittedLogin())],
    [
      field(
        "Email",
        "email",
        "email",
        "you@example.com",
        "email",
        model.loginEmail,
        ChangedLoginEmail,
      ),
      field(
        "Password",
        "password",
        "password",
        "Enter your password",
        "current-password",
        model.loginPassword,
        ChangedLoginPassword,
      ),
      submitButton("Sign in", model.pending),
    ],
  )
}

function registerForm(model: Model): Html {
  return h.form(
    [h.Class("grid gap-4"), h.OnSubmit(SubmittedRegister())],
    [
      field(
        "Name",
        "name",
        "text",
        "Ada Lovelace",
        "name",
        model.registerName,
        ChangedRegisterName,
      ),
      field(
        "Email",
        "email",
        "email",
        "you@example.com",
        "email",
        model.registerEmail,
        ChangedRegisterEmail,
      ),
      field(
        "Password",
        "password",
        "password",
        "Choose a password",
        "new-password",
        model.registerPassword,
        ChangedRegisterPassword,
      ),
      submitButton("Create account", model.pending),
    ],
  )
}

function createTodoForm(model: Model): Html {
  return h.form(
    [h.Class("flex gap-2"), h.OnSubmit(SubmittedTodo())],
    [
      h.input([
        h.Class(
          "flex h-10 min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm",
        ),
        h.Name("title"),
        h.Placeholder("Add a todo"),
        h.Value(model.newTodoTitle),
        h.OnInput((value) => ChangedNewTodoTitle({ value })),
      ]),
      submitButton("Add", model.pending),
    ],
  )
}

function field(
  label: string,
  name: string,
  type: string,
  placeholder: string,
  autocomplete: string,
  value: string,
  onInput: (input: { readonly value: string }) => Message,
): Html {
  return h.label(
    [h.Class("grid gap-2 text-sm font-medium")],
    [
      label,
      h.input([
        h.Class("h-10 rounded-md border bg-background px-3 py-2 text-sm"),
        h.Name(name),
        h.Type(type),
        h.Autocomplete(autocomplete),
        h.Placeholder(placeholder),
        h.Value(value),
        h.Required(true),
        h.OnInput((nextValue) => onInput({ value: nextValue })),
      ]),
    ],
  )
}

function submitButton(label: string, pending: boolean): Html {
  return h.button(
    [
      h.Class(
        "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
      ),
      h.Type("submit"),
      h.Disabled(pending),
    ],
    [pending ? "Working..." : label],
  )
}

function todoList(todos: ReadonlyArray<Todo>): Html {
  if (todos.length === 0) {
    return empty("No todos yet.")
  }

  return h.ul([h.Class("grid gap-3")], todos.map(todoItem))
}

function todoItem(todo: Todo): Html {
  return h.li(
    [],
    [
      h.button(
        [
          h.Class(
            "flex w-full items-center gap-3 rounded-lg border bg-background/70 px-4 py-3 text-left hover:bg-accent/40",
          ),
          h.Type("button"),
          h.AriaPressed(String(todo.completed)),
          h.OnClick(TodoToggled({ id: todo.id })),
        ],
        [
          h.span(
            [h.Class("grid size-5 place-items-center rounded border")],
            [todo.completed ? "✓" : ""],
          ),
          h.span(
            [
              h.Class(
                `min-w-0 flex-1 ${todo.completed ? "text-muted-foreground line-through" : ""}`,
              ),
            ],
            [todo.title],
          ),
        ],
      ),
    ],
  )
}

function authLink(prefix: string, label: string, route: Route): Html {
  return h.p(
    [h.Class("text-sm text-muted-foreground")],
    [
      `${prefix} `,
      h.button(
        [
          h.Class("underline"),
          h.Type("button"),
          h.OnClick(Navigate({ route })),
        ],
        [label],
      ),
      ".",
    ],
  )
}

function errorView(message: string | null): Html {
  return message === null ? h.div([], []) : errorCard(message)
}

function errorCard(message: string): Html {
  return h.p(
    [
      h.Class(
        "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive",
      ),
    ],
    [message],
  )
}

function empty(message: string): Html {
  return h.p(
    [
      h.Class(
        "rounded-xl border border-dashed p-5 text-sm text-muted-foreground",
      ),
    ],
    [message],
  )
}

function currentRoute(): Route {
  const route = window.location.hash.replace(/^#/, "")

  if (
    route === "/" ||
    route === "/login" ||
    route === "/register" ||
    route === "/todos"
  ) {
    return route
  }

  return "/"
}

function guardedRoute(route: Route, session: CurrentSession | null): Route {
  const publicRoute = route === "/login" || route === "/register"

  if (session === null && !publicRoute) {
    return "/login"
  }

  if (session !== null && publicRoute) {
    return "/"
  }

  return route
}

function setHash(route: Route) {
  if (window.location.hash !== `#${route}`) {
    window.location.hash = route
  }
}

function titleForRoute(route: Route) {
  if (route === "/login") return "Sign in"
  if (route === "/register") return "Register"
  if (route === "/todos") return "Todos"
  return "Dashboard"
}

const api = {
  async me(): Promise<CurrentSession | null> {
    const response = await request("/auth/me", { method: "GET" })

    if (response.status === 401) {
      return null
    }

    return readJson<CurrentSession>(response)
  },
  async login(input: { readonly email: string; readonly password: string }) {
    return readJson<CurrentSession>(
      await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    )
  },
  async register(input: {
    readonly name: string
    readonly email: string
    readonly password: string
  }) {
    return readJson<CurrentSession>(
      await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    )
  },
  async logout() {
    await readJson<{ readonly success: boolean }>(
      await request("/auth/logout", { method: "POST" }),
    )
  },
  async listTodos() {
    return readJson<ReadonlyArray<Todo>>(
      await request("/todos", { method: "GET" }),
    )
  },
  async createTodo(input: { readonly title: string }) {
    return readJson<Todo>(
      await request("/todos", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    )
  },
  async updateTodo(id: string, input: { readonly completed: boolean }) {
    return readJson<Todo>(
      await request(`/todos/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    )
  },
}

async function request(path: string, init: RequestInit) {
  return fetch(`${apiClientConfig.apiUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
    credentials: "include",
  })
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await responseErrorMessage(response))
  }

  return response.json()
}

async function responseErrorMessage(response: Response) {
  try {
    const body = await response.json()

    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      return body.message
    }

    if (
      typeof body === "object" &&
      body !== null &&
      "_tag" in body &&
      typeof body._tag === "string"
    ) {
      return body._tag
    }
  } catch {
    return response.statusText
  }

  return response.statusText
}
