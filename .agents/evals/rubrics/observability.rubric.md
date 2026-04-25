# Observability Rubric

Use for scenarios adding or improving observability.

## Required checks

- [ ] Uses or clearly follows `effect-observability-patterns`.
- [ ] Operation/workflow being observed is identified.
- [ ] Client-side spans are added for remote client operations where relevant.
- [ ] Server-side handler/domain spans or operation names are added where relevant.
- [ ] Repository spans are added when persistence debugging matters or absence is justified.
- [ ] Span names are stable and searchable.
- [ ] Annotations are useful and safe.
- [ ] No PII, tokens, secrets, raw payloads, or sensitive user input in annotations.
- [ ] Expected trace shape is documented for important flows.
- [ ] Local development observability docs are updated if workflow/setup changes.
- [ ] Validation/troubleshooting steps are reported.

## Fail conditions

- New remote mutation with no client/server observability and no justification.
- PII/secrets/raw payloads in span attributes.
- Local observability setup changed but docs not updated.
- Trace shape impossible to understand across layers.

## Scoring suggestion

- instrumentation coverage: 35
- safe annotations: 25
- local dev usability/docs: 25
- validation/final reporting: 15
