export type AppRoute =
  | { readonly name: "dashboard" }
  | { readonly name: "todos" }
  | { readonly name: "projects" }
  | { readonly name: "project"; readonly projectId: number }

export const routeFromPath = (path: string): AppRoute => {
  const parts = path.split("/").filter(Boolean)

  if (parts.length === 0) {
    return { name: "dashboard" }
  }

  if (parts[0] === "todos") {
    return { name: "todos" }
  }

  if (parts[0] === "projects" && parts.length === 1) {
    return { name: "projects" }
  }

  if (parts[0] === "projects" && parts.length === 2) {
    const projectId = Number(parts[1])
    if (Number.isFinite(projectId)) {
      return { name: "project", projectId }
    }
  }

  return { name: "dashboard" }
}

export const pathForRoute = (route: AppRoute): string => {
  switch (route.name) {
    case "dashboard":
      return "/"
    case "todos":
      return "/todos"
    case "projects":
      return "/projects"
    case "project":
      return `/projects/${route.projectId}`
  }
}
