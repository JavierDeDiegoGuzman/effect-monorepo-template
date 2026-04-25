# Atom Rules

## Canonical runtime shape

Atom modules should build a runtime from the Effect layers needed by that feature.

```ts
const apiRuntime = Atom.runtime(
  Layer.mergeAll(ApiClient.layer, ObservabilityLayer),
)
```

Use a module-level runtime when atoms in that file depend on the same services.

## Read atoms represent remote queries

Canonical shape:

```ts
export const projectsQuery = apiRuntime
  .atom(
    ApiClient.use((client) => client.projects.list()).pipe(
      Effect.withSpan("projects.list", { kind: "client" }),
    ),
  )
  .pipe(Atom.keepAlive, Atom.withReactivity(["projects"]))
```

Rules:

- name read atoms `*Query`
- use shared API/domain types at the boundary
- add tracing spans close to the remote effect
- use `Atom.keepAlive` for shared query-like state unless there is a reason not to
- use `Atom.withReactivity([...])` when writes should invalidate reads

## Mutation atoms represent commands/actions

Canonical shape:

```ts
export const createProjectAction = apiRuntime.fn(
  (input: CreateProjectInput) =>
    ApiClient.use((client) => client.projects.create({ payload: input })).pipe(
      Effect.annotateSpans({
        "project.name.length": input.name.length,
      }),
      Effect.withSpan("projects.create", { kind: "client" }),
    ),
  { reactivityKeys: ["projects"] },
)
```

Rules:

- name mutation atoms `*Action`
- accept typed inputs from the shared contract where possible
- call the typed API client inside the Effect
- annotate spans with safe metadata only
- set `reactivityKeys` to refresh dependent read atoms

## Local state vs atoms

Use local React state for:

- form inputs
- uncontrolled or temporary interaction state
- one-off pending UI toggles
- view-only toggles that do not need to be shared

Use atoms for:

- remote data read over time
- mutations that invalidate remote reads
- shared UI state that crosses component boundaries and benefits from the atom runtime
- state that participates in Effect services/reactivity

Do not move every piece of component state into atoms.

## Component integration pattern

```ts
const projectsState = useAtomValue(projectsQuery)
const [createProjectState, createProject] = useAtom(createProjectAction, {
  mode: "promise",
})
```

Rules:

- `useAtomValue(...)` for read/query atoms
- `useAtom(action, { mode: "promise" })` when the component needs inline action feedback
- `useAtomSet(action, { mode: "promise" })` when it only needs to trigger a write
- render query states explicitly with `AsyncResult.match(...)` or `AsyncResult.matchWithError(...)`
- keep `AsyncResult.match(...)` branching visible in screens
- avoid generic query renderer components that hide the main screen state model

## Reactivity keys

Use stable feature/domain names:

```txt
projects
todos
profile
settings
billing
notifications
auth
```

Use the same key across reads and writes that belong to the same invalidation domain.

## Parameterized/scoped queries

When a feature has both global and parent-scoped views, model both explicitly.

Example:

```ts
export const notesQuery = apiRuntime
  .atom(
    ApiClient.use((client) => client.notes.list()).pipe(
      Effect.withSpan("notes.list", { kind: "client" }),
    ),
  )
  .pipe(Atom.keepAlive, Atom.withReactivity(["notes"]))

export const notesByProjectQuery = (projectId: number) =>
  apiRuntime
    .atom(
      ApiClient.use((client) =>
        client.projects.notes({ path: { projectId } }),
      ).pipe(
        Effect.annotateSpans({ "project.id": projectId }),
        Effect.withSpan("projects.notes.list", { kind: "client" }),
      ),
    )
    .pipe(
      Atom.keepAlive,
      Atom.withReactivity(["notes", `project-notes:${projectId}`]),
    )
```

Rules:

- use the scoped query when route context already provides the parent scope
- prefer server/API scoped reads over fetching a global collection and filtering in a screen
- mutations that create, update, or delete linked records should invalidate both global and scoped keys
- related create forms should prefill, lock, or hide scope values already known from the route

## Observability

Observability belongs in the atom effect so the operation is observable regardless of which component triggers it.

Safe annotations include counts, lengths, IDs when acceptable, booleans, and enum values. Do not annotate tokens, passwords, emails, raw payloads, or sensitive user-entered content.

## Avoid

- generic atom factories before repeated pressure exists
- extra runtime composition layers without a need
- custom hooks that hide basic atom usage without a payoff
- generic query renderer components that hide screen state branching
- ad-hoc fetch calls inside components when a typed API client and atom should own the operation

## Checklist

- [ ] Is the state remote/shared rather than transient/local?
- [ ] Does the atom module build its runtime from the correct layers?
- [ ] Are read atoms named `*Query`?
- [ ] Are mutation atoms named `*Action`?
- [ ] Do reads and writes use matching reactivity keys?
- [ ] If both global and parent-scoped views exist, are scoped query atoms modeled explicitly?
- [ ] Do mutations invalidate every global and scoped read that can show affected data?
- [ ] Are spans/annotations present and safe?
- [ ] Does the consuming screen render query states explicitly?
- [ ] Does root atom wiring remain valid?
- [ ] Were docs updated if architecture changed?
