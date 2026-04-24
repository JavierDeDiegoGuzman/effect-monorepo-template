---
name: react-atom-architecture
description: Follow the current webapp atom architecture built on @effect/atom-react. Use when adding or refactoring atoms, wiring React components to remote state, or introducing new shared UI state in apps/webapp.
---

# React Atom Architecture

Use this skill when working on atoms in `apps/webapp`.

Read [references/atom-rules.md](references/atom-rules.md) before making changes.

## Goals

- Keep the current `@effect/atom-react` architecture consistent
- Model remote/shared state with atoms and keep transient form UI state local to React components
- Build atoms from an `Atom.runtime(...)` backed by the webapp's Effect layers
- Use atom reactivity keys so reads refresh after mutations
- Keep observability spans close to the atom effect that performs the work

## Current architecture summary

- Root setup in `apps/webapp/src/main.tsx` provides `RegistryProvider` and `ErrorBoundary`
- Shared remote state currently lives in `apps/webapp/src/atoms`
- Atom modules create an `apiRuntime` with:
  - `ApiClient.layer`
  - `ObservabilityLayer`
- Read/query atoms are created with `apiRuntime.atom(...)` and named `*Query`
- Mutation atoms are created with `apiRuntime.fn(...)` and named `*Action`
- Todos use the reactivity key `"todos"` so list reads refresh after create/update
- Components consume read atoms with `useAtomValue(...)` and render states explicitly with `AsyncResult.match(...)` / `AsyncResult.matchWithError(...)`
- Components consume write atoms with `useAtom(...)` or `useAtomSet(..., { mode: "promise" })` depending on whether they need the action state back in the UI

## Process

1. Identify whether the state is:
   - remote/shared state -> atom
   - transient component state such as form inputs, pending UI toggles, and one-off local interactions -> `React.useState` / `useTransition`
2. Keep atom definitions in `apps/webapp/src/atoms/<feature>.ts` unless there is a strong reason to colocate them elsewhere.
3. Build a feature runtime once per atom module with `Atom.runtime(Layer.mergeAll(...))`.
4. For read atoms:
   - wrap the Effect in `apiRuntime.atom(...)`
   - add `Effect.withSpan(...)` for the operation
   - usually pipe through `Atom.keepAlive`
   - add `Atom.withReactivity([...])` when mutations should invalidate the read
5. For write atoms:
   - use `apiRuntime.fn(...)`
   - keep inputs typed with shared schemas/types
   - add span annotations when useful
   - set `reactivityKeys` so dependent read atoms refresh automatically
6. In React components:
   - read with `useAtomValue(query)`
   - render query states explicitly with `AsyncResult.match(...)` / `AsyncResult.matchWithError(...)`
   - write with `useAtom(action, { mode: "promise" })` when the component needs action feedback, or `useAtomSet(action, { mode: "promise" })` when it only needs to trigger the action
   - keep submit/input/pending orchestration in the component
7. Preserve root support for atoms:
   - `RegistryProvider`
   - `ErrorBoundary` fallback for unexpected failures
8. After changes, run the webapp typecheck and any relevant project checks.

## Output expectations

When you change atom-related code:
- mention which atom file owns the feature state
- mention the query/action names used or added
- mention the reactivity keys used or added
- mention whether state stayed local to React or moved into atoms
- mention any new spans/annotations added for observability
