---
name: webapp-component-architecture
description: Design and refactor React webapp components using shadcn/ui as the primitive layer, Vercel-style composition patterns, and clear boundaries between ui, patterns, feature components, and screens.
---

# Webapp Component Architecture

Use this skill when working on React components in the webapp.

Read [references/component-architecture.md](references/component-architecture.md) before making changes. Read [code comment style](../_shared/comment-style.md) when adding or reviewing comments.

## Goals

- Treat shadcn/ui as the default primitive layer
- Avoid creating custom primitives when a shadcn component already exists
- Use composition instead of boolean prop proliferation
- Keep component responsibilities aligned with their architectural layer
- Separate visual primitives, layout patterns, feature UI, and route screens

## Layer model

- `components/ui/*`: primitives and shadcn-generated wrappers
- `components/patterns/*`: reusable layout and screen patterns built from `ui/*`
- `modules/<module>/components/*`: feature-specific UI pieces
- `components/screens/*`: thin route-level screens

## Process

1. Decide the layer before writing code:
   - primitive -> `ui`
   - reusable screen/layout recipe -> `patterns`
   - domain-specific UI -> `modules/<module>/components`
   - route entrypoint -> `screens`
2. If shadcn already provides the primitive, add or import that component instead of hand-rolling one.
3. If the change repeats structure across screens, extract a pattern component instead of duplicating markup.
4. Prefer explicit composition APIs:
   - children over render props for static structure
   - explicit variants/components over many booleans
   - compound components when multiple pieces share a stable structure
5. Keep business logic and data wiring out of `ui/*`.
6. Keep screens thin by moving reusable UI into `patterns/*` or `modules/<module>/components/*`.
7. Comment only non-obvious composition, accessibility, or platform tradeoffs; do not explain JSX structure or prop passthrough.
8. After edits, run the webapp checks.

## Documentation expectations

When applying this skill, update relevant docs if the component layer model, shadcn usage policy, shared patterns, or Storybook/testing expectations change.

Typical docs:

- `docs/webapp-architecture.md`
- `docs/testing.md`
- `docs/storybook.md`

Docs describe this template's concrete component setup. This skill describes the reusable component architecture pattern.

## Output expectations

When you change component architecture:
- mention which layer owns the new or changed component
- mention any shadcn component added or adopted
- mention any extracted pattern component
- mention any boundary change between UI and logic
