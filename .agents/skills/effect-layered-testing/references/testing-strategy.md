# Testing Strategy

Layered Effect backends should use different test styles for different layers.

## Layer under test: domain service

Use in-memory repositories.

Purpose:

- business rules
- domain errors
- validation
- orchestration logic
- normalization

Do not use SQL here unless explicitly writing a service integration test.

Example target behavior:

- duplicate email returns `UserAlreadyExists`
- missing project returns `ProjectNotFound`
- input is normalized before persistence

## Layer under test: SQL repository

Use a temporary SQL database.

Purpose:

- queries
- inserts/updates
- row-to-domain mapping
- constraints
- schema compatibility

Do not mock SQL repositories when testing SQL repositories.

## Layer under test: domain + SQL integration

Use domain services with SQL repositories and a temporary SQL database.

Purpose:

- verify domain services work correctly with real persistence
- catch wiring/mapping issues across layers

Use this sparingly; most domain behavior should be covered by in-memory tests.

## Layer under test: HTTP handlers

Prefer providing real domain services with in-memory repositories or focused mocks.

Purpose:

- route params/payload adaptation
- auth/session adaptation
- HTTP API behavior

Do not duplicate domain service tests at the handler layer.

## Test pyramid

Prefer many fast domain unit tests and fewer SQL integration tests:

```txt
many: domain service + in-memory repos
some: repository + temporary SQL
few: handler/full stack integration
```
