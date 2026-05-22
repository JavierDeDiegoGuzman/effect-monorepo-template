# Plan

## Context

Queremos convertir el webapp template en un punto de partida más opinionado y seguro para agentes, especialmente en tres áreas:

1. routing SPA con TanStack Router;
2. checks automáticos de boundaries arquitectónicos;
3. reglas explícitas de propiedad de markup/layout, sincronización React y testing de estado/componentes.

La intención no es prohibir capacidades arbitrariamente, sino definir **dónde** vive cada responsabilidad y hacer que los checks guíen a los agentes hacia los patrones correctos.

## Applicable skills

- `webapp-component-architecture`: ownership de `ui`, `patterns`, `domain`, `screens` y markup/layout.
- `webapp-screen-architecture`: screens finas, recipes de dashboard/collection/detail y route-level composition.
- `webapp-testing-architecture`: testing por capa, Storybook states, fixtures, ScreenView/container split.
- `react-atom-architecture`: screen integration con queries/actions y estado remoto.
- `vercel-composition-patterns`: providers con interfaces inyectables, composición, evitar boolean prop proliferation.
- `effect-observability-patterns`: mantener spans en atoms/remote operations cuando cambie routing/state wiring.

## Layer impact matrix

- shared contract/API: no
- backend persistence/repositories: no
- backend domain services: no
- HTTP/transport handlers: no
- auth/scope/access policy: no
- webapp atoms/state: yes, solo para docs/testing harness y posibles ajustes de screen views
- webapp UI/screens/routes: yes
- CLI/other clients: no
- tests/fixtures: yes
- observability: yes, docs/checklist; no cambio esperado de backend observability
- docs: yes

## Recommended approach

Implementarlo en fases pequeñas, con boundary checks antes de la migración de router para que la migración quede protegida.

### Phase 1 — Architecture boundary tooling

Añadir checks ejecutables para imports y reglas por capa.

Decisión recomendada:

- usar `dependency-cruiser` para import boundaries;
- añadir scripts `boundaries` / `verify:architecture`;
- añadir, si hace falta, un script AST pequeño para reglas JSX/hook que dependency-cruiser no cubre bien.

Reglas iniciales:

```txt
packages/shared
  must not import apps/server or apps/webapp

apps/webapp/src/components/ui
  must not import atoms, api, screens, domain, routes

apps/webapp/src/components/patterns
  may import ui/lib
  must not import atoms/api/screens/routes

apps/webapp/src/components/domain/<feature>
  may import ui/patterns/lib and shared types
  must not import screens/routes/atoms/api
  must not define full-page layout

apps/webapp/src/components/screens
  may import atoms/domain/patterns
  must not import api directly
  must not define structural JSX/layout directly

apps/webapp/src/routes or router files
  own route params/search/layout wiring only
  must not import atoms/api directly unless explicitly approved
  should render screens, not build feature UI

apps/webapp/src/atoms
  may import api/client and observability
  must not import React components

apps/server handlers/services/repositories
  keep existing layered backend boundaries enforceable where file structure supports it
```

JSX/layout ownership check:

- allow intrinsic structural JSX and layout classes in:
  - `components/ui/**`
  - `components/patterns/**`
  - `components/domain/**` for local feature markup only
- disallow structural JSX in:
  - `components/screens/**`
  - future `routes/**`

Initial forbidden structural JSX for screens/routes:

```txt
div, main, section, article, header, footer, aside, nav, ul, ol, li
```

Keep an explicit escape hatch only if needed, for example a comment such as:

```txt
architecture-allow: intrinsic-jsx -- reason
```

but require the reason to explain why the markup cannot be moved to `patterns/*` or `domain/*`.

### Phase 2 — Synchronization hooks policy

Add a project-owned hook layer for synchronization-specific effects and forbid direct `useEffect`/`useLayoutEffect` usage outside approved files.

Add files under:

```txt
apps/webapp/src/hooks/sync/
  use-document-title.ts
  use-event-listener.ts
  use-local-storage-state.ts
  use-media-query.ts
  use-on-mount.ts
  use-on-unmount.ts
  use-timeout.ts
  use-interval.ts
  index.ts
```

Rules:

```txt
Remote data       -> atoms/query/actions or router loader when appropriate
URL/search state  -> TanStack Router search APIs
localStorage      -> useLocalStorageState or persisted atom pattern
document title    -> useDocumentTitle
events            -> useEventListener/useWindowEvent
media query       -> useMediaQuery
timers            -> useTimeout/useInterval
mount/unmount     -> useOnMount/useOnUnmount for imperative integration only
```

Direct `useEffect` should be allowed only in:

```txt
apps/webapp/src/hooks/sync/**
apps/webapp/src/lib/react/**, if added
very small approved integration wrappers
```

Important guardrail:

- `useOnMount` must not become a fetch lifecycle hook. Remote data remains atoms/router loaders.

### Phase 3 — TanStack Router SPA migration

Migrate from current router wiring to TanStack Router in SPA mode.

Recommended structure:

```txt
apps/webapp/src/routes/
  __root.tsx
  index.tsx
  login.tsx
  register.tsx
  projects.tsx
  projects.$projectId.tsx
  todos.tsx

apps/webapp/src/router.tsx or routeTree.gen.ts, depending on chosen TanStack setup
```

Route file responsibilities:

- define path, params, search validation, route metadata;
- render the relevant screen;
- no feature markup;
- no ad-hoc layout;
- no API calls directly.

Screens remain the visible composition boundary:

```txt
routes/* -> screens/* -> patterns/domain/atoms
```

Update navigation in `AppShell` to use TanStack links/navigation while keeping layout ownership in `patterns/app-shell`.

### Phase 4 — Screen/container and testable view split

Codify a recommended split for stateful screens:

```txt
TodosScreen        -> connected container: atoms/actions/router context
TodosScreenView    -> render states and compose patterns/domain components
TodoList           -> pure domain component with props/callbacks
```

Do not force every existing screen to split immediately. Apply when:

- the screen has multiple query states;
- Storybook visual states are valuable;
- tests need loading/error/empty/populated/pending coverage;
- the screen starts accumulating logic.

Testing strategy:

```txt
ui/*
  stories mostly; minimal tests for custom behavior

patterns/*
  stories for slots/layout states; tests for composition behavior when needed

domain/*
  props + callbacks + fixtures; no atoms/router/API

screens/*
  prefer testing ScreenView with explicit props/AsyncResult states
  test connected Screen only for atom/router integration when necessary

atoms/*
  test separately only for non-trivial reactivity/error mapping

routes/*
  minimal route wiring tests or e2e smoke, not component internals
```

Add test helpers only when they make boundaries clearer:

```txt
apps/webapp/src/test/render.tsx
apps/webapp/src/test/fixtures.ts
apps/webapp/src/test/async-result-fixtures.ts
```

Potential helpers:

- `renderWithAppProviders` for shell/theme/router context when needed;
- `makeAsyncSuccess`, `makeAsyncError`, `makeAsyncInitial` wrappers if AsyncResult construction is noisy;
- provider-interface test helpers for compound components following Vercel composition patterns.

Avoid prematurely building a generic `renderWithAtoms` unless testing connected atom integration becomes necessary.

### Phase 5 — Documentation updates

Update docs for humans cloning the template:

- `docs/architecture.md`
  - add executable boundary checks and ownership rules.
- `docs/development.md`
  - add new scripts: `boundaries`, `verify:architecture`, router dev notes.
- `docs/testing.md`
  - formalize component state policy: props-first, ScreenView, provider interfaces, fixtures.
- `docs/storybook.md`
  - add guidance for ScreenView stories and visual state matrix.
- add `docs/webapp-architecture.md`
  - layer ownership, markup/layout ownership, route/screen/component responsibilities, sync hooks policy.
- optionally add `docs/frontend-synchronization.md` if sync hooks become substantial.

### Phase 6 — Skill updates

Update agent-facing skills so future agents follow the rules without rediscovering them.

#### `.agents/skills/webapp-component-architecture/references/component-architecture.md`

Add:

- explicit markup/layout ownership table;
- allowed intrinsic JSX locations;
- screens/routes should compose patterns/domain only;
- `domain/*` may use local markup but must not own full-page layout;
- when repeated layout appears, extract to `patterns/*`.

#### `.agents/skills/webapp-screen-architecture/references/screen-architecture.md`

Add:

- screens should not hand-roll structural JSX;
- screens should use official patterns for page structure;
- connected screen vs `ScreenView` recommendation;
- route params/search state should come from router, not manual URL effects.

#### `.agents/skills/webapp-testing-architecture/references/webapp-testing-rules.md`

Add:

- component state provisioning policy;
- provider-interface testing pattern from Vercel composition;
- ScreenView testing matrix;
- guidance to avoid generic atom harnesses unless integration requires it;
- Storybook visual states for ScreenView.

#### `.agents/skills/react-atom-architecture/references/atom-rules.md`

Add:

- atoms own remote/shared state, not component testing convenience;
- route URL state belongs to TanStack Router;
- direct effects/fetching in screens are disallowed;
- screen containers use atoms; views receive explicit state/callback props.

#### `.agents/skills/vercel-composition-patterns/rules/state-context-interface.md`

Add project-specific note or cross-reference:

- providers should accept injectable state interfaces for tests/stories;
- production provider may derive state from atoms/router/local hooks, but children only see the interface.

#### `.agents/skills/product-module-expansion/references/phased-module-process.md`

Add frontend phase checklist items:

- route file added in TanStack Router;
- screen uses patterns and no structural JSX;
- domain components are props-first/storybookable;
- scoped URL/search state uses router hooks;
- tests/stories cover loading/error/empty/populated/pending as relevant;
- boundary checks pass.

### Phase 7 — Verification and CI integration

Add scripts and document expected commands:

```bash
pnpm --filter @app/webapp check
pnpm --filter @app/webapp test
pnpm --filter @app/webapp build
pnpm --filter @app/webapp build-storybook
pnpm boundaries
pnpm verify:architecture
pnpm lint
```

If CI config exists or is added later, include:

```txt
check -> lint -> test -> build -> build-storybook -> verify:architecture
```

## Files likely to modify

Code/tooling:

- `package.json`
- `pnpm-lock.yaml`
- `apps/webapp/package.json`
- `apps/webapp/src/main.tsx`
- `apps/webapp/src/components/AppRouter.tsx` or replacement/removal
- `apps/webapp/src/lib/router.ts` or replacement/removal
- `apps/webapp/src/routes/**` new
- `apps/webapp/src/components/patterns/app-shell/AppShell.tsx`
- `apps/webapp/src/components/screens/*.tsx`
- `apps/webapp/src/components/patterns/**`
- `apps/webapp/src/hooks/sync/**` new
- `apps/webapp/src/test/**`
- boundary config files, for example `.dependency-cruiser.cjs` and/or `scripts/check-webapp-architecture.mjs`

Docs:

- `docs/architecture.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/storybook.md`
- `docs/webapp-architecture.md` new
- `docs/frontend-synchronization.md` optional new

Skills:

- `.agents/skills/webapp-component-architecture/references/component-architecture.md`
- `.agents/skills/webapp-screen-architecture/references/screen-architecture.md`
- `.agents/skills/webapp-testing-architecture/references/webapp-testing-rules.md`
- `.agents/skills/react-atom-architecture/references/atom-rules.md`
- `.agents/skills/vercel-composition-patterns/rules/state-context-interface.md`
- `.agents/skills/product-module-expansion/references/phased-module-process.md`

## Reuse

Existing assets to preserve and build on:

- `components/patterns/Screen.tsx` as the current page structure API.
- `components/patterns/app-shell/AppShell.tsx` as shell/layout owner.
- domain components such as `TodoList`, `TodoCreateForm`, `LoginForm`, already props-first and storybookable.
- `apps/webapp/src/test/fixtures.ts` for shared component/story fixtures.
- atom naming and reactivity conventions in `apps/webapp/src/atoms/*.ts`.
- existing Storybook and Vitest setup.

## Steps

- [ ] Add dependency/boundary tooling and initial import rules.
- [ ] Add JSX/layout ownership check for screens/routes.
- [ ] Run the checks, fix existing violations or document intentional exceptions.
- [ ] Add synchronization hook layer and direct `useEffect` restriction.
- [ ] Migrate router setup to TanStack Router SPA mode.
- [ ] Move route wiring into `routes/**` and keep screens as composition components.
- [ ] Refactor screens only as needed to satisfy layout ownership rules.
- [ ] Introduce `ScreenView` split for the screens that need test/story state coverage.
- [ ] Add or update tests/stories for representative loading/error/empty/populated/pending states.
- [ ] Update docs for architecture, development, testing, Storybook, and synchronization.
- [ ] Update skills with the new canonical rules and checklists.
- [ ] Run full webapp validation and architecture verification.

## Atomic commit plan

This change is large enough to split into multiple commits:

1. `architecture: add webapp boundary checks`
   - dependency-cruiser/custom checks, scripts, initial docs.
2. `webapp: add synchronization hook policy`
   - sync hooks, direct effect restrictions, docs.
3. `webapp: migrate spa routing to tanstack router`
   - dependencies, route files, provider wiring, app shell navigation.
4. `webapp: enforce screen markup ownership`
   - screen refactors into patterns/domain as needed.
5. `test: formalize component state testing patterns`
   - ScreenView examples, fixtures/helpers, stories/tests.
6. `agents: update webapp architecture skills`
   - skill/reference updates for future agents.
7. `docs: document opinionated webapp architecture`
   - final docs polish if not already fully covered per commit.

## Verification

Run at minimum:

```bash
pnpm --filter @app/webapp check
pnpm --filter @app/webapp test
pnpm --filter @app/webapp build
pnpm --filter @app/webapp build-storybook
pnpm boundaries
pnpm verify:architecture
pnpm lint
```

For full repository confidence after router/tooling changes:

```bash
pnpm check
pnpm build
pnpm lint
```

## Open decisions before implementation

- Use only `dependency-cruiser`, or combine it with a custom AST script for JSX/hook restrictions?
- Adopt TanStack Router file-based route generation or code-based route tree?
- Should `routes/**` be allowed to read atoms for loaders later, or must all remote state stay in screens/atoms?
- How strict should the first JSX allowlist be for `domain/*`? Recommended: allow local markup, forbid only full-page structural/layout patterns.
- Do we want a single `docs/webapp-architecture.md` or split synchronization into `docs/frontend-synchronization.md` immediately?
