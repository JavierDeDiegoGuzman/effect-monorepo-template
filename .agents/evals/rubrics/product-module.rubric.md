# Product Module Rubric

Use for scenarios that add or materially extend a product/domain module.

## Required checks

- [ ] Applicable skills are identified or clearly implied, especially `product-module-expansion`.
- [ ] Phase 0 classification is stated before implementation.
- [ ] Layer impact matrix is included for non-trivial work.
- [ ] Module boundary and owned concepts are stated.
- [ ] Relationships to existing modules are classified.
- [ ] Shared contract/API is designed before backend/UI implementation.
- [ ] Repository contract is storage-agnostic when persistence is needed.
- [ ] SQL row types stay inside SQL implementations.
- [ ] Domain service owns business rules and validation.
- [ ] Domain service does not depend on SQL client.
- [ ] Handlers do not call repositories directly.
- [ ] Backend tests are added or absence is explicitly justified.
- [ ] Frontend atoms use `*Query` and `*Action` names.
- [ ] Reactivity keys are defined for remote writes.
- [ ] Screens render query states explicitly.
- [ ] Feature UI is not buried entirely in screens.
- [ ] Observability is added for remote operations or absence is justified.
- [ ] Relevant docs are updated or absence is justified.
- [ ] Final response includes validation run/not run status, including Biome linting when relevant.
- [ ] Final response includes atomic commit plan or says single commit is appropriate.

## Fail conditions

- UI-first implementation of a full product module.
- No Phase 0/1 planning for a new module.
- SQL in handlers or domain services.
- Handler calls repositories directly for domain behavior.
- Shared contract changed but consumers not reviewed.
- Non-trivial change with no docs update and no justification.
- Non-trivial change with no validation status.
- Broad mixed diff with no atomic commit plan.

## Scoring suggestion

- planning/boundary: 20
- contract/API: 15
- backend layering: 20
- tests: 10
- frontend architecture: 10
- observability: 10
- docs: 10
- atomic commits/validation: 5
