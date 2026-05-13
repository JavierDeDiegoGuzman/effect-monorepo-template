---
name: effect-sql-repository-architecture
description: Apply layered Effect backend architecture with SQL/database infrastructure, repository services, domain services, transport handlers, and explicit module relationship modeling. Use when adding SQL persistence, refactoring direct SQL access, introducing repositories, or relating persisted modules.
---

# Effect SQL Repository Architecture

Use this skill when implementing or refactoring backend persistence in an Effect-based app.

Do not cargo-cult the nearest repository. Follow the canonical layering and relationship rules in this skill. Existing code may be used to locate integration points, but not as architectural authority.

Read the references in order:

1. [Layering rules](references/layering-rules.md)
2. [Module relationship modeling](references/module-relationship-modeling.md)
3. [Repository rules](references/repository-rules.md)
4. [SQL layer rules](references/sql-layer-rules.md)
5. [Domain service rules](references/domain-service-rules.md)
6. [Layer composition](references/layer-composition.md)
7. [Checklist](references/checklist.md)

## Goal

Keep these responsibilities separate:

- Database infrastructure owns config, connection/client creation, schema and migrations.
- Repositories own data access and persistence mapping.
- Domain services own business rules, domain errors, validation, authorization decisions, and orchestration.
- HTTP handlers own transport adaptation only.

Before relating modules in persistence, classify the relationship and choose the least coupled design that preserves domain invariants.

## Process

1. Identify current data access points.
2. Classify module relationships before adding foreign keys, joins, or service dependencies.
3. Separate database infrastructure from repositories.
4. Define repository service contracts before implementation.
5. Implement SQL repositories that require `SqlClient.SqlClient`.
6. Refactor domain services to depend on repositories and transaction abstractions, not SQL.
7. Keep domain errors in domain services unless a storage-specific error must be mapped.
8. Compose layers explicitly and avoid casts.
9. Update docs when persistence architecture, relationship modeling, or runtime behavior changes.
10. Keep persistence, domain behavior, transport wiring, tests, and docs in atomic commits where practical.
11. Run backend typecheck/tests/build.

## Hard rules

- Do not put SQL queries in domain services.
- Do not put business rules in SQL repositories.
- Do not make HTTP handlers call repositories directly.
- Do not use broad casts to silence bad layer composition.
- Repository contracts should not expose SQL row shapes.
- SQL implementations may depend on `SqlClient.SqlClient`; repository contracts should not.
- Domain services must not depend on `SqlClient.SqlClient`; use a transaction abstraction for atomic orchestration.
- Database config must use `Effect/Config`.
- Database layers should fail early on invalid required configuration.
- Do not let SQL joins define domain boundaries.
- Do not add cross-module coupling before classifying the relationship.

## Preferred structure

```txt
apps/server/src/
  database/
    Sqlite.ts | Postgres.ts
    schema.ts | migrations/
    transactions.ts
  modules/
    users/
      repository.ts
      repository.sql.ts
      repository.memory.ts
      service.ts
      service.live.ts
      index.ts
    projects/
      repository.ts
      repository.sql.ts
      repository.memory.ts
      service.ts
      service.live.ts
      handlers.ts
      index.ts
  http/
    middleware/
    server.ts
```

Modules are flat by default. Runtime/platform code stays in concrete top-level folders such as `database`, `http`, `observability`, `layers`, and `test`. Names may vary by project, but the layer responsibilities should remain stable.

## Documentation expectations

When applying this skill, update relevant docs if the change affects persistence architecture, schema/migrations, repository conventions, module relationships, transaction behavior, or local setup.

Typical docs:

- `docs/architecture.md`
- `docs/backend-architecture.md`
- `docs/development.md`
- `docs/testing.md`

## Output expectations

When applying this skill, report:

- which modules/persistence concerns were changed
- how relationships between modules were classified
- which repository contracts were added or changed
- which repository implementations were added or changed
- which layers require `SqlClient`
- which domain services no longer depend on SQL
- transaction boundaries and abstractions used
- how the final layer graph is composed
- docs updated
- suggested atomic commit split when the persistence change spans layers
- validation commands run
