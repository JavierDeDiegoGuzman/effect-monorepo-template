# Storybook

The webapp uses Storybook as the visual workshop for reusable UI, pattern, domain, and screen-adjacent components.

## Commands

Start Storybook locally:

```bash
pnpm --filter @app/webapp storybook
```

Build the static Storybook site:

```bash
pnpm --filter @app/webapp build-storybook
```

The local Storybook server defaults to `http://localhost:6006`.

## What Belongs In Storybook

Storybook should make important visual states explicit without requiring the API server to run.

Recommended coverage by layer:

- `components/ui/*`: primitive variants and accessibility-sensitive wrappers when useful
- `components/patterns/*`: layout states such as default, loading, empty, error, actions, and stats
- `features/<feature>/components/*`: forms, lists, pending states, empty states, read-only states, and callback-driven behavior
- `components/screens/*`: prefer stories for extracted `ScreenView` components with explicit loading, error, empty, populated, and pending props

Stories must use mock props and fixtures. They should not call production or local development APIs. Connected screens should not be forced into Storybook unless their atom/router boundaries are intentionally mocked.

## Current Stories

The initial catalog covers:

- `UI/Button`: variants, sizes, icon, disabled, and `asChild`
- `UI/Badge`: variants and `asChild` link usage
- `UI/Card`: standard header/content composition and content-only composition
- `UI/Input`: default, value, disabled, and invalid states
- `UI/Checkbox`: unchecked, checked, disabled, and labelled states
- `UI/Select`: placeholder, selected, small, and disabled states
- `UI/Breadcrumb`: default and collapsed paths
- `UI/Separator`: horizontal and vertical orientation
- `Patterns/Screen`: collection, loading, empty, and error states
- `Domain/Todos/TodoList`: populated, project metadata, and empty states
- `Domain/Todos/TodoCreateForm`: default, selected project, pending, and parent-scoped states
- `Domain/Auth/LoginForm`: empty, filled, and pending states
- `Domain/Projects/ProjectCreateForm`: empty, filled, and pending states

Shared mock fixtures live in `apps/webapp/src/test/fixtures.ts` so stories and component tests can use the same stable data without touching remote APIs.

## Relationship To Tests

Storybook is for visual review and component documentation. Vitest and Testing Library cover user-visible behavior and callback wiring:

```bash
pnpm --filter @app/webapp test
```

Prefer Testing Library assertions for behavior that can regress, such as form submission, disabled states, and item actions. Avoid snapshot-only coverage.
