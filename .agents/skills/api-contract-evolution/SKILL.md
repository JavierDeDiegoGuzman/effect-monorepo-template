---
name: api-contract-evolution
description: Safely evolve shared API contracts across shared schemas, server handlers, clients, CLI, tests, and docs. Use when changing shared API/domain schemas, endpoint inputs/outputs, typed errors, auth requirements, or route semantics.
---

# API Contract Evolution

Use this skill when changing shared API/domain contracts or behavior visible to clients.

Read [references/api-contract-rules.md](references/api-contract-rules.md) before making changes.

## Goals

- Keep server, webapp, CLI, tests, and docs aligned with the shared contract.
- Classify changes as breaking or non-breaking before implementation.
- Avoid duplicate request/response types in clients.
- Keep structural validation in schemas and business invariants in domain services.
- Make typed errors part of the contract, not incidental implementation details.

## Process

1. Identify the contract being changed: schema, endpoint, input, output, error, auth requirement, or semantics.
2. Classify the change as breaking, non-breaking, or migration-required.
3. Update shared schemas/API definitions first.
4. Update server handlers and domain services.
5. Review all typed clients/consumers and state the result: server, webapp atoms/UI, CLI/other clients, tests, scripts, docs.
6. Update error handling and user-facing states.
7. Update docs for public behavior.
8. Plan an atomic commit split if the contract change spans multiple layers.
9. Run shared, server, webapp, and CLI checks as relevant.

## Breaking change examples

- renaming or removing a field
- changing a field type
- making an optional input required
- changing endpoint route/method
- changing response shape
- changing typed error set in a way clients must handle
- adding auth/scope requirements to a previously public endpoint
- changing business semantics of an endpoint

## Non-breaking change examples

- adding a new endpoint
- adding an optional input with default behavior
- adding an output field clients may ignore
- adding a more specific error when clients already handle the parent/generic case
- adding docs/examples without behavior change

## Hard rules

- Any shared contract change must list all consumers reviewed, even when some are not affected.
- Breaking changes require an explicit migration or coordination note.
- Do not duplicate changed contract types in clients to avoid updating the shared contract.

## Documentation expectations

Update docs when API behavior, endpoint list, auth requirements, error semantics, or client usage changes.

Typical docs:

- `docs/api.md`
- `docs/architecture.md`
- `docs/auth-scopes.md`
- `docs/testing.md`

## Output expectations

When applying this skill, report:

- contract changed
- breaking/non-breaking classification
- shared schemas/API files changed
- server handlers/services changed
- webapp/CLI/test consumers changed
- error handling changes
- docs updated
- suggested atomic commit split when the change spans multiple layers
- validation commands run
