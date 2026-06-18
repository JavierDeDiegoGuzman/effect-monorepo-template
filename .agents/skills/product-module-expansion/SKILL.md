---
name: product-module-expansion
description: Add or extend a product/domain module end-to-end across shared contracts, backend, tests, frontend state, UI, screens, observability, and docs using the canonical phased process. Use for new SaaS capabilities or meaningful extensions of existing modules.
---

# Product Module Expansion

Use this skill when adding a new product capability or materially extending an existing domain module.

Do not cargo-cult the nearest feature. Implement the module through the phased process in this skill. Existing code may be used to locate integration points and conventions, but not as architectural authority.

Read the references in order:

1. [Phased module process](references/phased-module-process.md)
2. [Review checklist](references/review-checklist.md)
3. [Code comment style](../_shared/comment-style.md) when adding or reviewing comments

## Goals

- Add capabilities as coherent product modules, not scattered patches.
- Define boundaries and relationships before writing UI or SQL.
- Keep shared contracts, backend, tests, frontend state, UI, observability, and docs aligned.
- Preserve clear ownership across layers.
- Surface domain modeling tradeoffs before implementation.

## Phase summary

1. Classify the feature/change.
2. Complete the layer impact matrix.
3. Define the module boundary and domain relationships.
4. Identify relationship-driven UX entry points.
5. Design the shared contract.
6. Design persistence/repositories if needed.
7. Implement domain services.
8. Implement HTTP/transport handlers.
9. Add backend tests.
10. Add frontend atoms for remote/shared state.
11. Add feature UI components.
12. Add screens/routes/navigation.
13. Add observability.
14. Update docs.
15. Plan atomic commits.
16. Run final verification.

## Hard rules

- Do not write implementation code for a new product module before Phase 0 classification and Phase 1 boundary/relationship output are stated.
- Do not start with the UI for a full product module.
- Do not add persistence relationships before classifying the domain relationship.
- Do not add only a global collection screen for a relationship-bearing user-facing module without considering parent/detail entry points.
- Do not let SQL joins define module boundaries.
- Do not call repositories directly from HTTP handlers.
- Do not hide remote query state branching behind generic renderers in route screens.
- Do not skip tests and docs for architecture-affecting changes.
- Do not mix unrelated concerns into one broad change or commit.
- Do not add comments that narrate implementation; comments should preserve hidden product, safety, persistence, or compatibility rationale.
- Do not omit docs, tests, validation status, or atomic commit plan for non-trivial module work without explicit justification.
- If multiple domain models are reasonable and the choice affects future modules, stop and ask for confirmation.

## Documentation expectations

When applying this skill, update relevant docs in the same change if behavior or architecture changes. Typical docs:

- `docs/architecture.md`
- `docs/api.md`
- `docs/testing.md`
- `docs/observability.md`
- `docs/development.md`
- topic-specific docs such as `docs/backend-architecture.md`, `docs/webapp-architecture.md`, or `docs/auth-scopes.md`

Docs describe this template's concrete implementation. This skill describes the reusable process.

## Output expectations

When applying this skill, report:

- feature classification
- layer impact matrix
- module boundary and owned concepts
- relationships to existing modules and their classification
- relationship-driven UX entry points added or explicitly declined
- shared contracts added/changed
- persistence/repository design
- domain service behavior and transaction boundaries
- handlers/routes added or changed
- backend tests added
- frontend atoms, reactivity keys, and UI components added
- screens/routes/navigation changes
- observability added
- docs updated
- suggested atomic commit split
- validation commands run
