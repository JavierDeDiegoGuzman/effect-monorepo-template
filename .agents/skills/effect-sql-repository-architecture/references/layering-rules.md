# Layering Rules

The backend must be split into four conceptual layers.

## 1. Database / infrastructure layer

Owns:

- database configuration
- client creation
- connection lifecycle
- schema migration runner setup
- numbered schema migrations
- seed/bootstrap data separate from schema migrations

May depend on:

- `Effect/Config`
- platform filesystem
- SQL client packages
- `SqlClient.SqlClient`

Must not depend on:

- domain services
- HTTP handlers
- feature repositories

Example names:

```txt
SqliteLayer
PostgresLayer
DatabaseLayer
```

## 2. Repository layer

Owns:

- SQL queries
- data access
- persistence mappers
- storage-specific inserts/updates/deletes
- returning domain entities or repository DTOs

May depend on:

- database infrastructure
- `SqlClient.SqlClient`

Must not contain:

- business rules
- authorization rules
- HTTP concerns
- route params
- UI assumptions

## 3. Domain service layer

Owns:

- business rules
- domain validation
- domain errors
- orchestration across repositories
- transaction boundaries when operation spans several repositories

May depend on:

- repository contracts
- transaction/unit-of-work abstraction if available

Must not depend directly on:

- SQL row types
- SQL client
- HTTP request/response objects

Exception:

- temporary transaction handling may use `SqlClient.withTransaction`, but prefer introducing a `TransactionRunner` if this grows.

## 4. Transport layer

Owns:

- API handlers
- params/payload adaptation
- auth/session context extraction
- mapping domain result to HTTP API result

Must not:

- query repositories directly
- implement business rules
