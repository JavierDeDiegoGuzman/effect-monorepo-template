import type { CurrentSession } from "@app/shared"
import { Link, useRouterState } from "@tanstack/react-router"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AppShellProps = {
  readonly session: CurrentSession | null
  readonly children: React.ReactNode
  readonly sessionSummary?: React.ReactNode
  readonly onLogout?: () => void
}

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Todos", to: "/todos" },
] as const

export function AppShell({
  session,
  children,
  sessionSummary,
  onLogout,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.18),_transparent_32%),linear-gradient(180deg,_hsl(222_47%_11%),_hsl(224_71%_4%))] text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl min-h-16 items-center justify-between gap-4 px-4 py-4 sm:px-6">
          {session === null ? <div /> : <PrimaryNavigation />}

          {session === null ? null : (
            <div className="flex shrink-0 items-center gap-3">
              {sessionSummary}

              <Button
                variant="outline"
                onClick={() => {
                  onLogout?.()
                }}
              >
                Log out
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  )
}

function PrimaryNavigation() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <nav aria-label="Primary" className="flex shrink-0 items-center gap-2">
      {navItems.map((item) => {
        const active = pathname === item.to

        return (
          <Button
            key={item.label}
            asChild
            variant={active ? "default" : "outline"}
            className={cn(
              "min-w-24 justify-center shadow-sm",
              active &&
                "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <Link to={item.to} aria-current={active ? "page" : undefined}>
              {item.label}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
