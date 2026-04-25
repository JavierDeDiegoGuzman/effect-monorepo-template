# Phased Module Process

## Phase 0 — Classify the change

Decide what kind of work this is before touching code. Do not implement a new product module until Phase 0 classification and Phase 1 boundary/relationship output are stated.

Common classifications:

- small UI change
- existing module extension
- new product module
- API-only change
- backend infrastructure change
- auth/access/scope change
- observability/testing/tooling change
- cross-cutting platform capability

Output:

```txt
This is a new product module named <module>.
It is/is not user-facing.
It does/does not require shared API contracts.
It does/does not require persistence.
It is scoped by <tenant/account/workspace/project/etc.> or is global.
It relates to existing modules as <ownership/reference/scope/orchestration/access policy/shared context>.
```

If classification is unclear, stop and ask.

## Phase 0.5 — Complete layer impact matrix

For non-trivial module work, state the affected layers before implementation:

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

Every `yes` should be reflected later in the implementation, final report, tests/docs, or explicit justification.

## Phase 1 — Define boundary and relationships

Identify what the module owns.

Ask:

- What entity or capability is introduced?
- Which concepts are owned by this module?
- Which concepts belong to other modules?
- Does it have its own lifecycle?
- Is it user-facing?
- Is it scoped to a tenant/account/workspace/project/organization?
- Which existing modules does it reference or coordinate with?
- Which business invariants matter?

Classify every relationship as one or more of:

- ownership
- containment/scope
- reference
- orchestration
- access policy
- shared context

Do not add direct module coupling merely because two tables can be joined.

## Phase 2 — Design the shared contract

Define contract before backend implementation and UI.

Typical contract pieces:

- entity schemas
- input schemas
- output schemas if needed
- tagged errors
- API group/endpoints
- auth middleware requirement if applicable
- exports from the shared package

Separate responsibilities:

- shared schemas validate API shape and structural constraints
- domain services enforce business invariants
- repositories and database constraints protect persistence integrity

Example shape:

```ts
export class Project extends Schema.Class<Project>("Project")({
  id: Schema.Number,
  name: Schema.String,
}) {}

export class CreateProjectInput extends Schema.Class<CreateProjectInput>(
  "CreateProjectInput",
)({
  name: Schema.NonEmptyString,
}) {}

export class ProjectNotFound extends Schema.TaggedErrorClass<ProjectNotFound>()(
  "ProjectNotFound",
  { id: Schema.Number },
  { httpApiStatus: 404 },
) {}
```

## Phase 3 — Design persistence and repositories

If persistence is needed, design repository contracts before SQL.

Repository contracts expose domain concepts, not SQL rows.

For scoped resources, make the scope explicit in method signatures and names. The scope may be tenant, account, workspace, organization, project, or another product context.

Examples:

```ts
readonly listByAccount: (accountId: number) => Effect.Effect<ReadonlyArray<Project>>
readonly getByIdInTenant: (tenantId: number, id: number) => Effect.Effect<Project | null>
readonly createForOrganization: (organizationId: number, input: CreateProjectRecord) => Effect.Effect<Project>
```

When persistence links modules, decide whether the link is:

- foreign-key ownership
- nullable reference
- join table
- denormalized read model
- event/outbox relationship
- access/membership table
- shared scope column

## Phase 4 — Implement domain services

Domain services own:

- business rules
- normalization
- domain validation
- domain errors
- relationship validation
- permission/business authorization checks when applicable
- orchestration across repositories/services
- transaction boundaries

Domain services must not depend on SQL clients, SQL row types, HTTP request/response objects, or React/UI assumptions.

If a use case performs multiple writes that must be atomic, use a transaction abstraction.

## Phase 5 — Implement HTTP/transport handlers

Handlers own transport adaptation only:

- read params and payload
- read auth/context services
- call domain services
- adapt typed errors
- add HTTP/span annotations

Handlers must not:

- query repositories directly
- implement business rules
- perform ad-hoc authorization logic that belongs in access/domain services
- know SQL details

## Phase 6 — Add backend tests

Prefer layered tests:

- domain service tests with in-memory repositories
- SQL repository tests with temporary databases
- handler/API tests for transport behavior
- integration tests only where layer wiring matters

For scoped resources, add cross-scope isolation tests. If a scoped resource is added and no cross-scope test is added, explicitly justify why.

## Phase 7 — Add frontend atoms

Remote/shared state belongs in atoms.

Rules:

- read atoms end in `*Query`
- mutation atoms end in `*Action`
- atom inputs/outputs use shared contract types
- mutation actions define reactivity keys
- atom effects include spans
- transient form and interaction state stays local

Canonical shape:

```ts
export const projectsQuery = apiRuntime
  .atom(
    ApiClient.use((client) => client.projects.list()).pipe(
      Effect.withSpan("projects.list", { kind: "client" }),
    ),
  )
  .pipe(Atom.keepAlive, Atom.withReactivity(["projects"]))

export const createProjectAction = apiRuntime.fn(
  (input: CreateProjectInput) =>
    ApiClient.use((client) => client.projects.create({ payload: input })).pipe(
      Effect.withSpan("projects.create", { kind: "client" }),
    ),
  { reactivityKeys: ["projects"] },
)
```

## Phase 8 — Add feature UI components

Feature components belong to the domain/module UI layer.

They should:

- use `ui/*` primitives and `patterns/*` layout components
- receive data and callbacks as props where practical
- own local transient form state when appropriate
- avoid direct API calls
- avoid direct atom usage unless the component is intentionally a container
- be easy to render in Storybook with mock props

## Phase 9 — Add screens, routes, and navigation

Screens should be thin route-level composition.

Screens own:

- route-level query/action wiring
- explicit `AsyncResult.match(...)` state branching
- composition of patterns and feature components
- route params and local route orchestration

Screens should not own:

- large reusable layout recipes
- raw API calls
- business logic
- deep primitive-level markup that belongs in feature/pattern components

Add navigation only when the module is user-facing.

## Phase 10 — Add observability

Every remote operation should be observable. New remote mutations must include client and server observability or explicitly justify why not.

Add spans/annotations in:

- frontend atoms
- HTTP handlers
- domain services
- repository operations where useful

Do not put PII, secrets, tokens, raw payloads, or sensitive business data in span attributes.

Expected trace shape for a typical create operation:

```txt
<module>.create
  http.client POST /<module>
    http.server POST /<module>
      <Module>.create
        Sql<Module>Repository.create
```

## Phase 11 — Update docs

Update docs when the module changes public behavior, architecture, runtime setup, testing strategy, observability, or auth/scope behavior.

Docs are not optional for architecture-affecting work. If docs are not updated for non-trivial work, the final response must include `Docs not updated because: <reason>`.

## Phase 12 — Plan atomic commits

Before finalizing a substantial module change, split the work into reviewable commits.

Good commit boundaries usually follow architecture boundaries:

```txt
1. shared contract/schema/API definitions + API docs
2. database schema/repository contract/SQL repository + repository tests
3. domain service behavior + domain tests
4. HTTP handlers/API integration + handler tests
5. frontend atoms + state docs if needed
6. feature UI components + stories/tests
7. screens/routes/navigation
8. observability/docs polish
9. final cleanup
```

Rules:

- each commit should have one purpose
- each commit should include its tests/docs when practical
- avoid mixing refactors with behavior changes
- avoid mixing formatting churn with implementation
- avoid broad commits that cannot be reverted independently
- if the diff is hard to describe in one sentence, split it

When reporting completion, mention the suggested commit split if the change is larger than a small patch.

## Phase 13 — Final verification

For full-stack module changes, prefer:

```bash
pnpm check
pnpm build
pnpm lint
pnpm --filter @app/server test
```

Also run package-specific checks, Storybook/frontend test commands, and Biome formatting/lint commands when relevant. Use `pnpm lint:fix` or `pnpm format` intentionally; do not mix broad formatting churn into unrelated commits.
