import * as React from "react"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { pathForRoute, type AppRoute } from "@/lib/router"
import { cn } from "@/lib/utils"

type AppShellProps = {
  readonly route: AppRoute
  readonly children: React.ReactNode
}

const navItems: ReadonlyArray<{ readonly label: string; readonly route: AppRoute }> = [
  { label: "Dashboard", route: { name: "dashboard" } },
  { label: "Todos", route: { name: "todos" } },
  { label: "Projects", route: { name: "projects" } },
]

const isActive = (current: AppRoute, target: AppRoute) => {
  if (current.name === target.name) {
    return true
  }

  return current.name === "project" && target.name === "projects"
}

export function AppShell({ route, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.18),_transparent_32%),linear-gradient(180deg,_hsl(222_47%_11%),_hsl(224_71%_4%))] text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href={pathForRoute({ name: "dashboard" })} className="text-lg font-semibold tracking-tight sm:text-xl">
            Effect template
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-2">
            {navItems.map((item) => {
              const active = isActive(route, item.route)

              return (
                <Button
                  key={item.label}
                  asChild
                  variant="outline"
                  className={cn(
                    "min-w-24 justify-center",
                    active &&
                      "border-primary/70 bg-primary/15 text-primary hover:bg-primary/20",
                  )}
                >
                  <Link
                    href={pathForRoute(item.route)}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  )
}
