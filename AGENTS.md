This repository is a full-stack Effect template with a React webapp.

## Project overview

- Package manager: `pnpm`
- Backend and shared contracts use Effect-based patterns
- The webapp uses React, `@effect/atom-react`, and shadcn/ui primitives
- The template is meant to be axample on the patterns to follow, not just provide working code

## Webapp architecture

The frontend is organized in layers:

- `src/components/ui/*`: shadcn/ui primitives and direct shadcn-generated wrappers
- `src/components/patterns/*`: reusable screen and layout patterns built from `ui/*`
- `src/components/domain/<feature>/*`: feature-specific UI pieces
- `src/components/screens/*`: thin route-level screens that compose patterns and feature components
- `src/atoms/*`: remote/shared state and mutations using `@effect/atom-react`

## Atom usage conventions

- Prefer `*Query` names for read atoms and `*Action` names for write atoms
- Consume queries with `useAtomValue(...)` and render them explicitly with `AsyncResult.match(...)` / `AsyncResult.matchWithError(...)`
- Keep query state branching visible in screens instead of hiding it behind generic renderer components
- Use action state explicitly for inline pending/error feedback near the form or list that triggered the action
- `src/api/*`: API client and config for remote calls

## Design principles

- Prefer shadcn/ui primitives by default
- Do not invent a custom primitive if a shadcn component already exists
- Use composition instead of boolean prop proliferation
- Keep screens thin and focused on one primary responsibility
- Prefer explicit query state rendering in screens with `AsyncResult.match(...)`
- Keep layout decisions in app shell and pattern components, not ad hoc inside screens
- Keep feature logic out of `ui/*`
- Keep transient form state local unless it truly needs to be shared

## Module model

A new product module should usually include:

- shared contract/types
- backend implementation
- frontend atoms for remote state and mutations
- feature UI components
- one or more screens
- navigation updates if the module is user-facing

## Available skills

### `webapp-component-architecture`
Use when designing or refactoring components, introducing reusable UI, deciding where a component belongs, or applying shadcn + composition rules.

### `webapp-screen-architecture`
Use when designing or refactoring screens, app shell behavior, dashboard structure, page headers, or deciding how to split responsibilities across pages.

### `webapp-module-expansion`
Use when introducing a new product/domain module end-to-end across shared contracts, server, atoms, feature UI, screens, and navigation.

### Existing specialized skills
The repository also includes skills for:
- Effect service configuration
- React atom architecture
- Vercel composition patterns

Use the most specific skill for the task. It is normal to combine a webapp skill with `react-atom-architecture` when a change affects both UI structure and atoms.

## Agent guidance

- For UI work, start by deciding the layer: `ui`, `patterns`, `feature`, or `screens`
- For screen work, preserve app-shell geometry and consistent spacing across routes
- For module work, design the contract and ownership boundaries before writing UI
- After meaningful webapp changes, run at least:
  - `pnpm --filter @app/webapp check`
  - `pnpm --filter @app/webapp build`
