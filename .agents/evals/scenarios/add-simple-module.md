# Scenario: Add a Simple Product Module

## Task prompt

```txt
Add a notes module. A note has title, body, and completed status. Users should be able to list, create, and update notes from a user-facing screen.
```

## Expected skills

- `product-module-expansion`
- `api-contract-evolution`
- `effect-sql-repository-architecture` if persistence is added
- `effect-layered-testing`
- `react-atom-architecture`
- `webapp-component-architecture`
- `webapp-screen-architecture`
- `effect-observability-patterns`

## Expected agent behavior

- State Phase 0 classification before implementation.
- Include layer impact matrix.
- Define module boundary and owned concepts.
- Design shared contract before UI.
- Implement backend through repository/domain/handler layers.
- Add tests or justify absence.
- Add atoms using `*Query` and `*Action`.
- Add feature UI components before or alongside thin screens.
- Add observability for remote operations.
- Update docs or justify why not.
- Include validation status and atomic commit plan.

## Fail conditions

- Starts by building the screen/UI without contract and boundary.
- Handler calls repository directly.
- Domain service uses SQL client.
- Atoms/components call ad-hoc fetch instead of typed client + atom pattern.
- No docs or tests justification.
- No validation status.
- No atomic commit plan.

## Rubric

Use `../rubrics/product-module.rubric.md`.
