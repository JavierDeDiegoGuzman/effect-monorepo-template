# Scenario: API Contract Change

## Task prompt

```txt
Rename Project.name to Project.title across the shared contract, server, webapp, CLI, tests, and docs.
```

## Expected skills

- `api-contract-evolution`
- `product-module-expansion` if behavior expands beyond the rename
- `react-atom-architecture` if atoms are affected
- `effect-layered-testing` if tests/fixtures are affected

## Expected agent behavior

- Classify the rename as breaking or migration-required.
- Review all consumers: server, webapp, CLI, tests, docs.
- Update shared schema/API first.
- Update typed errors/fixtures where relevant.
- Avoid adding client-local duplicate types.
- Update docs or justify why not.
- Include validation status and atomic commit plan.

## Fail conditions

- Rename performed in shared/server but not webapp or CLI.
- No breaking-change classification.
- No consumer review list.
- Client code works around shared contract by introducing local duplicate shape.
- Docs omitted without justification.

## Rubric

Use `../rubrics/api-contract.rubric.md`.
