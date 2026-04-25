---
name: effect-layered-testing
description: Design and implement tests for layered Effect backends that separate database infrastructure, repositories, domain services, and transport handlers. Use when adding unit tests with mocked/in-memory repositories, integration tests with temporary SQL databases, transaction abstractions, or test layers for Effect services.
---

# Effect Layered Testing

Use this skill when adding tests for an Effect backend that follows layered architecture:

```txt
infra/sql -> repositories -> domain services -> http handlers
```

Read the references in order:

1. [Testing strategy](references/testing-strategy.md)
2. [In-memory repository tests](references/in-memory-repository-tests.md)
3. [Temporary SQL tests](references/temporary-sql-tests.md)
4. [Transaction test rules](references/transaction-test-rules.md)
5. [Test layer composition](references/test-layer-composition.md)
6. [Checklist](references/checklist.md)

## Goals

- Test domain services without a real database by providing in-memory repository layers.
- Test SQL repositories against a temporary database, not production/dev data.
- Keep test dependencies explicit through Effect layers.
- Avoid broad casts or hidden globals in tests.
- Reuse the same repository contracts in production and tests.
- Keep domain tests focused on business behavior, not SQL mechanics.

## Process

1. Identify the layer under test: domain service, repository implementation, database infra, or HTTP handler.
2. Choose the minimal test dependency graph:
   - domain unit tests: domain service + in-memory repositories
   - repository integration tests: SQL repository + temporary SQL layer
   - service integration tests: domain service + SQL repositories + temporary SQL layer
   - handler tests: handlers + domain dependencies, usually mocked unless testing full stack
3. Add or reuse test layers under `src/test/layers/*`.
4. For domain tests, seed in-memory repositories with domain objects.
5. For SQL tests, create a temporary database and initialize schema.
6. Use transaction abstraction rather than leaking `SqlClient` into domain services.
7. Run backend check, tests, and build.

## Hard rules

- Do not test domain services by hitting production/dev databases.
- Do not make domain services depend on SQL just for tests.
- Do not mock domain services when the unit under test is a domain service; mock repositories instead.
- Do not make repository contracts test-specific.
- Do not expose SQL row shapes in tests outside SQL repository tests.
- Do not use broad casts to silence unresolved Effect layer requirements.
- Do not let tests depend on shared mutable global state.
- Temporary SQL databases must be isolated per test suite or per test layer instance.
- Do not add persistence behavior without repository tests against temporary SQL, unless explicitly justified.
- Do not add domain behavior without domain service tests, unless explicitly justified.
- Do not add scoped resource behavior without cross-scope tests, unless explicitly justified.

## Preferred structure

```txt
apps/server/src/
  repositories/
    memory/
      InMemory<Resource>Repository.ts
      InMemoryTransactions.ts
    sql/
      Sql<Resource>Repository.test.ts
  services/
    <Resource>Service.test.ts
  test/
    layers/
      TestSqliteLayer.ts
      SqlRepositoriesTestLayer.ts
      InMemoryRepositoriesLayer.ts
      DomainTestLayer.ts
    fixtures/
      <resources>.ts
```

## Documentation expectations

When applying this skill, update relevant docs if the testing strategy, test layers, commands, fixtures, or verification workflow changes.

Typical docs:

- `docs/testing.md`
- `docs/backend-architecture.md`
- `docs/development.md`

Docs describe this template's concrete test setup. This skill describes the reusable testing pattern.

## Output expectations

When applying this skill, report:

- which layer is under test
- which dependencies are mocked/in-memory
- which dependencies use real SQL/database infra
- which test layers were added or reused
- what test data/fixtures are used
- validation commands run
