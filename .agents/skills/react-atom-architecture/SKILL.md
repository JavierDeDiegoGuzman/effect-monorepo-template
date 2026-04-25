---
name: react-atom-architecture
description: Follow the webapp atom architecture built on @effect/atom-react. Use when adding or refactoring atoms, wiring React components to remote state, or introducing new shared UI state in apps/webapp.
---

# React Atom Architecture

Use this skill when working on atoms in the webapp.

Do not cargo-cult the nearest atom. Follow the canonical pattern in this skill. Existing atoms may be used to locate integration points and naming conventions, but not as architectural authority.

Read [references/atom-rules.md](references/atom-rules.md) before making changes.

## Goals

- Keep `@effect/atom-react` usage consistent.
- Model remote/shared state with atoms and keep transient form UI state local to React components.
- Build atoms from an `Atom.runtime(...)` backed by Effect layers.
- Use atom reactivity keys so reads refresh after mutations.
- Keep observability spans close to the atom effect that performs the work.
- Keep route-level query state branching visible in screens.

## Process

1. Identify whether the state is remote/shared or transient/local.
2. Put remote/shared feature state in an atom module for that feature.
3. Build a feature runtime once per atom module with `Atom.runtime(Layer.mergeAll(...))`.
4. For read atoms:
   - wrap the Effect in `apiRuntime.atom(...)`
   - name it `*Query`
   - add `Effect.withSpan(...)`
   - usually pipe through `Atom.keepAlive`
   - add `Atom.withReactivity([...])` when mutations should invalidate the read
5. For write atoms:
   - use `apiRuntime.fn(...)`
   - name it `*Action`
   - use shared contract input types
   - add span annotations when useful and safe
   - set `reactivityKeys` to refresh dependent reads
6. In React screens/components:
   - read with `useAtomValue(query)`
   - render query states explicitly with `AsyncResult.match(...)` / `AsyncResult.matchWithError(...)`
   - write with `useAtom(action, { mode: "promise" })` when action state is needed
   - write with `useAtomSet(action, { mode: "promise" })` when only triggering the action
   - keep transient form/input/pending orchestration local
7. Preserve root support for atoms: registry/provider and error boundary according to the app architecture.
8. Update docs if atom/state architecture changes.
9. Run webapp checks/tests/build as relevant.

## Documentation expectations

Update relevant docs when atom runtime setup, state ownership, API client wiring, observability, or screen query rendering patterns change.

Typical docs:

- `docs/webapp-architecture.md`
- `docs/architecture.md`
- `docs/observability.md`
- `docs/testing.md`

## Output expectations

When changing atom-related code, report:

- atom file/module that owns the feature state
- query/action names used or added
- reactivity keys used or added
- state kept local vs moved into atoms
- spans/annotations added for observability
- docs updated if architecture changed
- validation commands run
