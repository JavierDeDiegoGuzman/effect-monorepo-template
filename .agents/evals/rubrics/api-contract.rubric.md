# API Contract Rubric

Use for scenarios changing shared API/domain contracts.

## Required checks

- [ ] Uses or clearly follows `api-contract-evolution`.
- [ ] Contract change is identified: schema, input, output, endpoint, error, auth requirement, or semantics.
- [ ] Change is classified as breaking, non-breaking, or migration-required.
- [ ] Breaking changes include migration/coordination notes.
- [ ] Shared contract is updated before consumers.
- [ ] Consumers reviewed and reported: server, webapp, CLI/other clients, tests, docs.
- [ ] Typed errors are updated when clients need to handle expected failures.
- [ ] Structural schema validation is not confused with domain business validation.
- [ ] Docs are updated or absence is explicitly justified.
- [ ] Validation status is reported.

## Fail conditions

- Shared contract changed without consumer review.
- Breaking change not identified.
- Client-local duplicate types added to avoid contract update.
- Server/webapp/CLI drift from shared API.
- No docs update or justification for public API behavior change.

## Scoring suggestion

- classification: 20
- shared contract correctness: 20
- consumer alignment: 25
- errors/validation semantics: 15
- docs/validation/commit plan: 20
