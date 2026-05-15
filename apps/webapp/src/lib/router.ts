export type AppRoute =
  | { readonly name: "login" }
  | { readonly name: "register" }
  | { readonly name: "dashboard" }
  | { readonly name: "todos" }

export const routeFromPath = (path: string): AppRoute => {
  const parts = path.split("/").filter(Boolean)

  if (parts.length === 0) {
    return { name: "dashboard" }
  }

  if (parts[0] === "login") {
    return { name: "login" }
  }

  if (parts[0] === "register") {
    return { name: "register" }
  }

  if (parts[0] === "todos") {
    return { name: "todos" }
  }

  return { name: "dashboard" }
}

export const pathForRoute = (route: AppRoute): string => {
  switch (route.name) {
    case "login":
      return "/login"
    case "register":
      return "/register"
    case "dashboard":
      return "/"
    case "todos":
      return "/todos"
  }
}
