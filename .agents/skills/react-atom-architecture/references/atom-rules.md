# Atom Rules For This Repository

This repository currently uses `@effect/atom-react` in `apps/webapp` for shared and remote UI state.

## Source of truth

Treat these files as the canonical examples:

- `apps/webapp/src/main.tsx`
- `apps/webapp/src/atoms/todos.ts`
- `apps/webapp/src/components/screens/TodosScreen.tsx`
- `apps/webapp/src/api/client.ts`
- `apps/webapp/src/observability.ts`

## Architectural rules

### 1. Root wiring is required

The app root currently enables atom usage like this:

- `RegistryProvider` at the top level
- `ErrorBoundary` for unexpected render failures

Do not introduce atoms that assume a different root model unless the app architecture is intentionally changing.

## 2. Build atom runtimes from webapp layers

Current pattern:

```ts
const apiRuntime = Atom.runtime(
  Layer.mergeAll(ApiClient.layer, ObservabilityLayer),
)
```

Use a module-level runtime when atoms in that file depend on the same services.

Why:

- keeps atom definitions close to the services they need
- avoids reaching for ad-hoc global singletons
- preserves the current Effect-first architecture

## 3. Read atoms represent remote queries

Current example:

```ts
export const todosQuery = apiRuntime
  .atom(
    ApiClient.use((client) => client.todos.list()).pipe(
      Effect.withSpan("todos.list", { kind: "client" }),
    ),
  )
  .pipe(Atom.keepAlive, Atom.withReactivity(["todos"]))
```

Follow this shape for remote reads:

- define the Effect that fetches data
- wrap it in `apiRuntime.atom(...)`
- name it `*Query`
- add a tracing span
- use `Atom.keepAlive` for shared query-like state unless there is a reason not to
- use `Atom.withReactivity(["<feature>"])` when writes should invalidate the read

## 4. Mutation atoms represent commands/actions

Current examples:

```ts
export const createTodoAction = apiRuntime.fn(
  (input: CreateTodoInput) =>
    ApiClient.use((client) => client.todos.create({ payload: input })).pipe(
      Effect.annotateSpans({
        "todo.title.length": input.title.length,
      }),
      Effect.withSpan("todos.create", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["todos"] },
)
```

```ts
export const updateTodoAction = apiRuntime.fn(
  ({ id, input }: { readonly id: number; readonly input: UpdateTodoInput }) =>
    ApiClient.use((client) =>
      client.todos.update({ params: { id }, payload: input }),
    ).pipe(
      Effect.annotateSpans({
        "todo.id": id,
        "todo.completed": input.completed,
      }),
      Effect.withSpan("todos.update", {
        kind: "client",
      }),
    ),
  { reactivityKeys: ["todos"] },
)
```

Follow this shape for writes:

- use `apiRuntime.fn(...)`
- name it `*Action`
- accept typed inputs, ideally from `@app/shared`
- call the typed API client inside `ApiClient.use(...)`
- annotate spans when input metadata is useful
- set `reactivityKeys` to refresh dependent read atoms

## 5. React components own transient UI state

Current screens keep these concerns local:

- input text with `React.useState`
- pending UI with `React.useTransition`
- submit and click handlers

That is the current boundary.

Use local React state for:

- uncontrolled or form-like temporary input
- in-progress interaction state
- view-only toggles that do not need to be shared

Use atoms for:

- remote data the UI reads from multiple renders over time
- mutations that should invalidate shared reads
- feature state that must participate in Effect services/reactivity

Do not move every piece of component state into atoms.

## 6. Component integration pattern

Current component usage:

```ts
const todosState = useAtomValue(todosQuery)
const [createTodoState, createTodo] = useAtom(createTodoAction, {
  mode: "promise",
})
const [updateTodoState, updateTodo] = useAtom(updateTodoAction, {
  mode: "promise",
})
```

Keep this pattern when wiring components:

- `useAtomValue(...)` for read/query atoms
- render query states explicitly with `AsyncResult.match(...)` or `AsyncResult.matchWithError(...)`
- `useAtom(action, { mode: "promise" })` when the component needs inline action feedback
- `useAtomSet(action, { mode: "promise" })` when the component only needs to trigger an async write
- orchestrate transitions in React with `startTransition(...)`
- keep the `AsyncResult.match(...)` branching visible in screens instead of hiding it behind generic renderer abstractions

## 7. Reactivity keys should be feature-oriented

Today the feature keys are:

- `"todos"`
- `"projects"`

For new features, prefer stable feature/domain names such as:

- `"profile"`
- `"settings"`

Use the same key across reads and writes that belong to the same invalidation domain.

## 8. Prefer shared API/domain types at the boundary

Current atoms import:

- `CreateTodoInput`
- `UpdateTodoInput`
- `CreateProjectInput`
- `UpdateProjectInput`

Keep atom inputs/outputs aligned with `packages/shared` instead of creating duplicate frontend-only request shapes when the API already defines them.

## 9. Observability belongs in the atom effect

The current architecture adds spans directly where the Effect is built.

Keep this behavior close to the read/write atom implementation so the operation stays observable regardless of which component triggers it.

## 10. Keep the pattern simple

The current atom architecture is intentionally small and practical.

Avoid introducing extra abstractions unless there is repeated pressure for them, such as:

- generic atom factories used by multiple features
- additional runtime composition layers
- custom hooks that hide basic `useAtomValue` / `useAtom` / `useAtomSet` usage without a clear payoff
- generic query renderer components that hide the main `AsyncResult.match(...)` branching from screens

## Checklist before finishing

- Is the state truly shared/remote, or should it stay local to the component?
- Does the atom module build its runtime from the correct layers?
- Do read atoms use `Atom.withReactivity(...)` where needed?
- Do mutation atoms declare matching `reactivityKeys`?
- Are query atoms named `*Query` and mutation atoms named `*Action`?
- Are spans/annotations present for remote operations?
- Does the consuming component render query states explicitly with `AsyncResult.match(...)`?
- Does the root still provide `RegistryProvider` and `ErrorBoundary`?
