# Scenario: Observability Flow

## Task prompt

```txt
Improve local development observability for project creation. A developer should be able to create a project in the webapp and understand the trace from client action to server domain behavior and SQL persistence.
```

## Expected skills

- `effect-observability-patterns`
- `react-atom-architecture`
- `effect-sql-repository-architecture` if repository instrumentation changes

## Expected agent behavior

- Identify project creation as the workflow.
- Add or verify client atom span.
- Add or verify handler route/method annotations.
- Add or verify domain operation span/name.
- Add repository span/name when persistence debugging matters.
- Use safe annotations only.
- Update `docs/observability.md` with expected trace shape and troubleshooting if needed.
- Include validation status and atomic commit plan.

## Fail conditions

- Adds PII/raw user input to span attributes.
- Only instruments one side of the client/server workflow without justification.
- Changes local OTEL setup without docs.
- Expected trace shape remains unclear.

## Rubric

Use `../rubrics/observability.rubric.md`.
