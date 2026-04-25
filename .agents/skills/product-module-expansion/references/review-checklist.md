# Product Module Review Checklist

## Planning

- [ ] The applicable skills were identified.
- [ ] The layer impact matrix was completed for non-trivial work.
- [ ] Phase 0 classification was stated before implementation.
- [ ] Phase 1 boundary/relationship output was stated before implementation for new modules.

## Boundary

- [ ] The change has been classified before implementation.
- [ ] The module has a clear product/domain name.
- [ ] It is not a vague bucket such as `misc`, `data`, `tools`, or `admin-stuff`.
- [ ] Owned concepts are explicit.
- [ ] Concepts owned by other modules are not duplicated.
- [ ] Relationships to existing modules are classified.
- [ ] Relationship-driven UX entry points were identified for user-facing relationships.
- [ ] Expected parent/detail surfaces were added or explicitly declined with a product reason.
- [ ] Modeling tradeoffs were surfaced before implementation when they affect future modules.

## Contract

- [ ] Shared schemas exist where server and clients cross a boundary.
- [ ] Shared typed errors exist for expected domain failures.
- [ ] API group/endpoints exist when the module is remote.
- [ ] Inputs and outputs do not duplicate frontend/backend-only shapes unnecessarily.
- [ ] Structural validation and business validation are separated.
- [ ] All consumers of changed contracts were reviewed.

## Backend

- [ ] Repository contracts are storage-agnostic.
- [ ] SQL row types stay inside SQL implementations.
- [ ] Domain services do not depend on SQL clients or row shapes.
- [ ] Handlers do not call repositories directly.
- [ ] Business rules live in domain/access services, not handlers or SQL repositories.
- [ ] Transactions use an abstraction.
- [ ] Config is local and uses Effect Config if needed.

## Relationships and scope

- [ ] Persistence relationships match the classified domain relationship.
- [ ] Scoped resources include scope explicitly in service/repository operations.
- [ ] Client-provided scope is not trusted without validation.
- [ ] Access policy is not hidden inside SQL joins.
- [ ] Cross-scope existence is not leaked.

## Frontend state

- [ ] Remote/shared state uses atoms.
- [ ] Read atoms end in `*Query`.
- [ ] Mutation atoms end in `*Action`.
- [ ] Reactivity keys are defined and match invalidation needs.
- [ ] Transient form/interaction state stays local.
- [ ] Atom effects include spans.

## Relationship-driven UX

- [ ] Global collection screens exist where the module needs global browse/manage workflows.
- [ ] Parent/detail screens show related records when the relationship is a primary contextual workflow.
- [ ] Parent-scoped create/update flows do not ask users for context already known from the route.
- [ ] Scoped reads/mutations are represented in atoms when the UI has scoped surfaces.
- [ ] Mutations invalidate both global and scoped reads when both can show affected data.
- [ ] Navigation or deep links connect global and scoped surfaces where useful.

## UI architecture

- [ ] shadcn/ui primitives are preferred.
- [ ] Reusable layout goes into patterns.
- [ ] Feature UI goes into the domain/module folder.
- [ ] Screens stay thin.
- [ ] Screens render query states explicitly.
- [ ] No boolean prop proliferation.
- [ ] Important visual states are storybookable when Storybook is available.

## Testing

- [ ] Domain behavior is tested.
- [ ] SQL repository behavior is tested against a temporary DB if persistence changed.
- [ ] Handler/API behavior is tested where transport matters.
- [ ] Frontend states are tested or covered by stories where relevant.
- [ ] Cross-scope/cross-tenant tests exist when scoped resources are involved, or absence is explicitly justified.

## Observability

- [ ] Client operations have spans, or absence is explicitly justified.
- [ ] Server operations have spans, or absence is explicitly justified.
- [ ] Useful non-PII annotations exist.
- [ ] Errors are visible in traces.
- [ ] Important flows are documented in observability docs when relevant.

## Atomic commits

- [ ] The diff can be split into clear, reviewable commits.
- [ ] Each suggested commit has one purpose.
- [ ] Related tests/docs are grouped with the code they validate.
- [ ] Refactors are separated from behavior changes where practical.
- [ ] Formatting-only churn is separated or avoided.
- [ ] No broad mixed commit is required to understand or revert the work.

## Docs and verification

- [ ] Relevant docs were updated, or absence is explicitly justified.
- [ ] Docs describe the concrete template implementation.
- [ ] Skills remain general and reusable.
- [ ] Required checks/builds/tests were run.
