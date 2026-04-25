import type * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

function Root({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "border-border/60 bg-card/85 shadow-2xl backdrop-blur",
        className,
      )}
      {...props}
    />
  )
}

function Header({
  className,
  ...props
}: React.ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn("gap-2", className)} {...props} />
}

function Title({
  className,
  ...props
}: React.ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle
      className={cn("text-3xl tracking-tight", className)}
      {...props}
    />
  )
}

function Description({
  className,
  ...props
}: React.ComponentProps<typeof CardDescription>) {
  return (
    <CardDescription
      className={cn("max-w-3xl text-sm leading-6 sm:text-base", className)}
      {...props}
    />
  )
}

function Body({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={cn("space-y-6", className)} {...props} />
}

function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("space-y-4", className)} {...props} />
}

function SectionDivider(props: React.ComponentProps<typeof Separator>) {
  return <Separator className="bg-border/80" {...props} />
}

function SectionHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-1", className)} {...props} />
}

function SectionTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />
}

function SectionDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

function Actions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

function Stats({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)} {...props} />
  )
}

function Stat({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/70 bg-background/70 p-4",
        className,
      )}
      {...props}
    />
  )
}

function StatLabel({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-xs uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

function StatValue({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("mt-1 text-lg font-semibold", className)} {...props} />
  )
}

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border/80 bg-background/40 p-6 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

function Loading(props: React.ComponentProps<typeof Empty>) {
  return <Empty {...props} />
}

function ErrorState({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-sm text-destructive",
        className,
      )}
      {...props}
    />
  )
}

export const Screen = {
  Root,
  Header,
  Title,
  Description,
  Body,
  Section,
  SectionDivider,
  SectionHeader,
  SectionTitle,
  SectionDescription,
  Actions,
  Stats,
  Stat,
  StatLabel,
  StatValue,
  Empty,
  Loading,
  Error: ErrorState,
}
