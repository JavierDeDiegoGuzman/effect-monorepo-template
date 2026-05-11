# Webapp Architecture

The webapp is intentionally opinionated so humans and agents put responsibilities in predictable places.

## Layer ownership

- `src/components/ui/*`: shadcn/ui primitives and thin primitive wrappers only.
- `src/components/patterns/*`: reusable layout recipes, page structure, shell pieces, section patterns, empty/loading/error states.
- `src/components/domain/<feature>/*`: props-first feature UI such as forms, lists, summaries, and feature-specific cards.
- `src/components/screens/*`: connected screen containers. Screens read atoms, branch on `AsyncResult`, wire actions, and compose patterns/domain components.
- `src/router.tsx`: TanStack Router SPA route tree, auth redirects, route params, and shell outlet wiring.
- `src/atoms/*`: remote/shared state and mutations backed by the typed API client and Effect observability spans.

## Markup and layout ownership

Structural markup (`div`, `section`, `main`, `header`, `nav`, `ul`, `li`, etc.) belongs in `ui`, `patterns`, and local feature components. Screens and route files should compose named components instead of hand-rolling structure.

If a screen needs repeated layout, extract it to `components/patterns/*`. If it is feature-specific UI, extract it to `components/domain/<feature>/*`.

An escape hatch exists for exceptional cases:

```tsx
{/* architecture-allow: intrinsic-jsx -- explain why this cannot be a pattern/domain component */}
```

## Routing

The app uses TanStack Router with hash history for SPA routing. Route responsibilities are limited to:

- path definitions;
- param/search validation and conversion;
- auth redirect and app-shell outlet wiring;
- rendering screens.

Routes should not call APIs directly or build feature UI. The normal flow is:

```txt
router -> screens -> patterns/domain -> ui
              |
              -> atoms -> typed api client
```

## Synchronization hooks

Direct `useEffect` and `useLayoutEffect` are restricted. Use the project-owned hooks in `src/hooks/sync/*` for browser synchronization:

- `useDocumentTitle`
- `useEventListener` / `useWindowEvent`
- `useLocalStorageState`
- `useMediaQuery`
- `useOnMount` / `useOnUnmount`
- `useTimeout`
- `useInterval`

Remote data does not belong in effects. Use atoms/query actions, or a router loader later when that route explicitly owns the data policy.

## Executable checks

Run architecture checks with:

```bash
pnpm boundaries
pnpm verify:architecture
```

`pnpm boundaries` enforces import boundaries with dependency-cruiser. `pnpm verify:architecture` also checks screen/route intrinsic JSX ownership and direct effect usage.
