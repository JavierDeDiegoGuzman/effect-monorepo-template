---
name: effect-observability-patterns
description: Add and maintain observability for Effect backends and React clients, especially local development tracing, span naming, safe annotations, error visibility, and docs. Use when adding remote operations, changing runtime observability, or improving debugging workflows.
---

# Effect Observability Patterns

Use this skill when adding or changing observable operations, tracing setup, local observability workflow, or debugging docs.

Read [references/observability-rules.md](references/observability-rules.md) before making changes.

## Goals

- Make local development observability usable, not decorative.
- Ensure important user flows can be followed across client, HTTP, domain, and persistence layers.
- Keep span names and annotations consistent.
- Avoid leaking PII, secrets, tokens, raw payloads, or sensitive business data.
- Keep docs current so developers know how to see traces locally.

## Process

1. Identify the operation or workflow to observe.
2. Add client-side spans near the atom/effect that performs the remote work.
3. Add handler spans/annotations for route, method, and stable non-sensitive identifiers.
4. Add domain service spans using operation names that match domain behavior.
5. Add repository spans when persistence latency or mapping matters.
6. Ensure errors appear in traces without leaking sensitive data.
7. Verify local observability workflow if runtime setup changed.
8. Update observability/development docs with expected trace shape for important flows.

## Hard rules

- New remote mutations must include client and server observability, or explicitly justify why not.
- Do not put PII, secrets, tokens, raw payloads, passwords, or sensitive business data in span attributes.
- If an annotation is derived from user input, prefer length/count/boolean/category rather than the raw value.
- If local observability setup changes, update development/observability docs in the same change.

## Span naming guidance

Prefer stable operation names:

```txt
<module>.list        // client atom/query/action
http.<module>.list   // transport adaptation if manually named
<Module>.list        // domain service
Sql<Module>Repository.list // persistence
```

Exact names may vary, but they should be predictable and searchable.

## Annotation rules

Good annotations:

- route pattern
- HTTP method
- module name
- operation name
- stable numeric/internal IDs when safe
- boolean flags that are not sensitive
- lengths/counts instead of raw strings

Avoid:

- bearer tokens
- passwords
- emails unless explicitly approved
- raw payloads
- raw user-entered text
- private customer data
- secrets/config values

## Documentation expectations

Update docs when observability setup, commands, env vars, expected services, expected trace shape, or troubleshooting changes.

Typical docs:

- `docs/observability.md`
- `docs/development.md`
- `docs/testing.md` when observability affects tests/smoke checks

## Output expectations

When applying this skill, report:

- operations/workflows instrumented
- spans added or changed
- annotations added and why they are safe
- expected trace shape
- local observability verification performed
- docs updated
- validation commands run
