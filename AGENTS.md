# Agent Guide

This repository is a full-stack Effect SaaS template with a React webapp. The included product modules are examples of the template patterns, not the architectural authority.

## Template intent

- Prefer changes that strengthen reusable architecture over changes that only make the current example work.
- Skills define canonical implementation patterns and review checklists.
- `docs/*` describes this template's concrete current architecture, runtime setup, and development workflows.
- When existing code conflicts with a skill, prefer the skill, update the implementation, and update the relevant docs.
- Do not cargo-cult the nearest feature. Use existing code only to find integration points and project conventions.

## Project overview

- Package manager: `pnpm`
- Linting/formatting: Biome via `pnpm lint`, `pnpm lint:fix`, and `pnpm format`
- Backend and shared contracts use Effect-based patterns
- The webapp uses React, `@effect/atom-react`, and shadcn/ui primitives
- The template is intended to demonstrate scalable SaaS architecture: contracts, layered backend, typed clients, observability, testing strategy, and maintainable UI composition

## Primary objective

The primary objective of this repository is to be a high-quality full-stack Effect SaaS template.

The `.agents/*` directory is meta-infrastructure for maintaining the template with coding agents. It is not part of the product/runtime template itself. Agent evals, skills, and rubrics exist to keep the template architecture healthy over time.

Do not let eval harnesses, agent workflows, or meta tooling obscure the product template for developers cloning the repo. User-facing template documentation belongs in `docs/*`; agent-maintenance material belongs in `.agents/*`.

## Source of truth

- `AGENTS.md`: global operating rules for agents
- `.agents/skills/*`: reusable architecture and implementation patterns
- `.agents/evals/*`: optional evaluation harness for checking whether agents follow the skills
- `docs/*`: concrete documentation for this template's current behavior and workflows
- Code: current implementation example; useful for integration context, not as the final authority if it diverges from skills/docs

## Webapp architecture

The frontend is organized in layers:

- `src/components/ui/*`: shadcn/ui primitives and direct shadcn-generated wrappers
- `src/components/patterns/*`: reusable screen and layout patterns built from `ui/*`
- `src/components/screen-parts/*`: screen-specific presentational pieces for non-module surfaces
- `src/modules/<module>/components/*`: feature-specific UI pieces
- `src/modules/<module>/atoms.ts`: remote/shared feature state and mutations using `@effect/atom-react`
- `src/components/screens/*`: thin route-level screens that compose patterns and feature components
- `src/api/*`: API client and config for remote calls

## Atom usage conventions

- Prefer `*Query` names for read atoms and `*Action` names for write atoms
- Consume queries with `useAtomValue(...)` and render them explicitly with `AsyncResult.match(...)` / `AsyncResult.matchWithError(...)`
- Keep query state branching visible in screens instead of hiding it behind generic renderer components
- Use action state explicitly for inline pending/error feedback near the form or list that triggered the action
- Keep transient form and interaction state local unless it truly needs to be shared or remote
- When a resource has both global and parent-scoped views, model both reads explicitly with query atoms and make mutations invalidate all affected reactivity keys

## Design principles

- Prefer shadcn/ui primitives by default
- Do not invent a custom primitive if a shadcn component already exists
- Use composition instead of boolean prop proliferation
- Keep screens thin and focused on one primary responsibility
- Keep layout decisions in app shell and pattern components, not ad hoc inside screens
- Keep feature logic out of `ui/*`
- Keep backend handlers as transport adaptation only
- Keep domain services independent of SQL and HTTP details
- Keep repository contracts storage-agnostic
- Keep configuration local to the service/layer that owns it
- Make observability and tests part of the feature, not afterthoughts
- Keep formatting and linting clean with Biome; avoid mixing broad formatting churn with behavior changes

## Canonical full-stack architecture rules

Detailed policy lives in `docs/architecture.md`, `docs/api.md`, `docs/testing.md`, and `docs/development.md`. These rules are mandatory for new product/runtime work:

- Backend request flow is always `HTTP handler -> Service/use-case Module -> Repository Interface -> Adapter`.
- Handlers are transport adapters only and must not call repositories directly.
- Services own product behavior, ID generation, normalization, scope/authorization decisions, repository coordination, and conversion to shared contract models.
- Repositories are flat query adapters. `repository.ts` owns repository input/record schemas and repository interfaces.
- Repositories must not generate IDs or contain product logic.
- Public/persisted entity IDs should be branded UUID strings; creation services generate UUIDs inline with `Random.nextUUIDv4`.
- SQL adapters must use Effect SQL `SqlSchema` for every persistent operation.
- Canonical persistence adapters are `memory`, `sqlite`, and `postgres`. JSON and Drizzle are legacy/transitional and must not be extended.
- Expected client-visible errors live in shared contracts with explicit HTTP status/body definitions. Persistence/internal errors map to a safe shared `InternalServerError`.
- Canonical e2e tests use a typed client against a fetchable app with a temporary SQLite database and schema reset before each test.

## Product module model

A new product module should usually be added through the phased product-module process:

1. classify the feature/change
2. define module boundary and domain relationships
3. design the shared contract
4. design persistence/repositories if needed
5. implement domain services
6. implement HTTP handlers
7. add backend tests
8. add frontend atoms
9. add feature UI components
10. add screens/routes/navigation
11. add observability
12. update docs
13. run final verification

Use `product-module-expansion` for this process. Do not start by building the UI unless the change is explicitly UI-only.

## Relationship-driven UX

When adding or extending a module that references, belongs to, or is scoped by another user-facing module, do not stop at a global collection screen.

For each classified relationship, decide whether the related parent/detail screen should expose:

- a scoped list of related records
- a contextual create form
- edit/update affordances for related records
- navigation or deep links to the global collection or related detail pages

If a resource can be linked to a project, account, workspace, organization, or similar user-facing parent, the parent detail screen should usually show and create linked resources unless there is a clear product reason not to.

Examples:

- Notes linked to projects should appear on the project detail screen.
- Todos linked to projects should appear on the project detail screen.
- Billing records scoped to an account should appear on account or billing detail surfaces.

## Available skills

Use the most specific skill for the task. Combine skills when a change crosses boundaries.

### Product and API

- `product-module-expansion`: add or extend a product/domain module end-to-end through the canonical phased process
- `api-contract-evolution`: change shared API contracts safely across server, webapp, CLI, tests, and docs
- `saas-auth-scope-architecture`: design auth, tenant/account/workspace scoping, membership, permissions, and cross-scope isolation

### Backend

- `effect-sql-repository-architecture`: add/refactor SQL persistence with infra, repository, domain service, and handler boundaries; classify module relationships before coupling modules
- `effect-service-config`: add/refactor Effect Config ownership and startup validation
- `effect-layered-testing`: test layered Effect backends with in-memory repositories, temporary SQL, and explicit test layers
- `effect-observability-patterns`: instrument local and production observability across atoms, handlers, services, repositories, and runtime setup

### Webapp

- `webapp-component-architecture`: design/refactor components using shadcn/ui, patterns, feature UI, and thin screens
- `webapp-screen-architecture`: design/refactor screens, app shell behavior, page headers, dashboards, collections, and detail pages
- `react-atom-architecture`: wire remote/shared state with `@effect/atom-react`, reactivity keys, and observable atom effects
- `webapp-testing-architecture`: add frontend tests and Storybook stories/interactions for visual states and behavior
- `vercel-composition-patterns`: apply scalable React composition patterns and avoid boolean prop proliferation

## Required planning for non-trivial changes

Before implementing a non-trivial or cross-layer change, state the applicable skills and the layer impact matrix.

Layer impact matrix:

```txt
- shared contract/API: yes/no
- backend persistence/repositories: yes/no
- backend domain services: yes/no
- HTTP/transport handlers: yes/no
- auth/scope/access policy: yes/no
- webapp atoms/state: yes/no
- webapp UI/screens/routes: yes/no
- CLI/other clients: yes/no
- tests/fixtures: yes/no
- observability: yes/no
- docs: yes/no
```

For new product modules, Phase 0 and Phase 1 from `product-module-expansion` must be completed before writing implementation code.

For relationship-bearing modules, include a relationship-driven UX matrix:

```txt
- global collection screen: yes/no
- parent/detail related section: yes/no
- parent-scoped create/update flow: yes/no
- scoped query/action atoms: yes/no
- navigation/deep links: yes/no
- reason for any omitted expected surface: <reason>
```

## Documentation expectations

When a change affects architecture, public API behavior, runtime setup, auth/scope behavior, observability, testing strategy, or module boundaries, update the relevant docs in the same change.

If docs are not updated for a non-trivial change, the final response must include:

```txt
Docs not updated because: <reason>
```

Common docs:

- `docs/architecture.md`
- `docs/api.md`
- `docs/development.md`
- `docs/observability.md`
- `docs/testing.md`

Add focused docs when a topic becomes substantial, for example:

- `docs/backend-architecture.md`
- `docs/webapp-architecture.md`
- `docs/auth-scopes.md`
- `docs/storybook.md`

## Atomic commit guidance

Prefer small, reviewable, atomic commits. This is part of the development workflow, not an optional cleanup step.

A good atomic commit:

- has one clear purpose
- keeps related code, tests, and docs together
- can be reviewed independently
- can be reverted independently
- leaves the repo in a working state when possible

Avoid commits that mix unrelated concerns, such as:

- schema changes plus unrelated UI polish
- refactors plus behavior changes without separation
- formatting churn mixed with feature implementation
- docs for one topic bundled with code for another topic
- broad "update stuff" commits

For larger features, prefer a sequence like:

1. contract/schema changes with docs
2. persistence/repository changes with tests
3. domain service behavior with tests
4. transport/API wiring with tests
5. frontend atoms
6. feature UI/screens
7. observability/docs polish
8. final cleanup

The exact order can vary, but each commit should tell a coherent story. If a task becomes too large, pause and split the work before continuing.

Agents should mention when a change is large enough to deserve multiple commits, and should avoid creating broad mixed diffs unless explicitly requested.

For non-trivial changes, the final response must include an atomic commit plan. For trivial changes, state that a single commit is appropriate.

## Verification guidance

After meaningful webapp changes, run at least:

- `pnpm --filter @app/webapp check`
- `pnpm --filter @app/webapp build`

After meaningful backend/shared changes, run at least:

- `pnpm --filter @app/server check`
- `pnpm --filter @app/server test` when tests are affected or added
- `pnpm --filter @app/server build`
- `pnpm --filter @app/shared check`

After full-stack module changes, prefer:

- `pnpm check`
- `pnpm build`
- `pnpm lint`
- relevant tests and smoke checks

After formatting-only or lint-related changes, run:

- `pnpm lint`
- `pnpm format` only when intentionally rewriting formatting

Final responses must include validation status:

```txt
Validation run:
- <command>: passed/failed

Not run:
- <command or check>: <reason>
```
