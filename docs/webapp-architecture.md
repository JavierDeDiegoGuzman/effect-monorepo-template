# Webapp Architecture

The webapp uses predictable layers so humans and agents know where responsibilities belong.

## Layer ownership

- `src/components/ui/*`: shadcn/ui primitives and thin primitive wrappers only.
- `src/components/patterns/*`: reusable layout recipes, page structure, shell pieces, section patterns, empty/loading/error states.
- `src/components/screen-parts/*`: screen-specific presentational pieces for non-module composition surfaces such as the dashboard; these may know multiple module types but should not own atoms or router setup.
- `src/modules/<module>/components/*`: props-first module UI such as forms, lists, summaries, and feature-specific cards.
- `src/modules/<module>/atoms.ts`: remote/shared module state and mutations backed by the typed API client and Effect observability spans.
- `src/components/screens/*`: connected screen containers. Screens read atoms, branch on `AsyncResult`, wire actions, and compose patterns/screen-parts/module components.
- `src/router.tsx`: TanStack Router SPA route tree, auth redirects, route params, and shell outlet wiring.

Webapp modules may contain only `atoms.ts`, `components/`, `index.ts`, and optional private `internal/` helpers. Screens and routes stay outside modules because they compose multiple modules.

## Import boundaries

External imports from a module must target the module index:

```ts
import { TodoList, todosQuery } from "@/modules/todos"
```

Do not import deep module files from outside the module:

```ts
import { TodoList } from "@/modules/todos/components/TodoList"
```

## Markup and layout ownership

Structural markup (`div`, `section`, `main`, `header`, `nav`, `ul`, `li`, etc.) belongs in `ui`, `patterns`, and local module components. Screens and route files should compose named components instead of hand-rolling structure.

If a screen needs repeated layout, extract it to `components/patterns/*`. If it is module-specific UI, extract it to `modules/<module>/components/*`. If it is specific to a non-module screen surface, extract it to `components/screen-parts/*`.

An escape hatch exists for exceptional cases:

```tsx
{/* architecture-allow: intrinsic-jsx -- explain why this cannot be a pattern/module component */}
```

## Routing

The app uses TanStack Router with hash history for SPA routing. Route responsibilities are limited to path definitions, params/search conversion, auth redirects, app-shell outlet wiring, and rendering screens.

Normal flow:

```txt
router -> screens -> patterns/screen-parts/modules -> ui
              |
              -> module atoms -> typed api client
```

## Synchronization hooks

Direct `useEffect` and `useLayoutEffect` are restricted. Use the project-owned hooks in `src/hooks/sync/*` for browser synchronization. Remote data does not belong in effects; use query/action atoms.

## Executable checks

Run architecture checks with:

```bash
pnpm boundaries
pnpm verify:architecture
```

`pnpm verify:architecture` checks import boundaries, screen/route intrinsic JSX ownership, direct effect usage, and module filesystem layout.
