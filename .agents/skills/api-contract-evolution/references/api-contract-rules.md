# API Contract Rules

## Contract ownership

The shared API contract owns:

- domain schemas crossing process/client boundaries
- endpoint groups
- route params and payload schemas
- success response schemas
- typed domain/transport errors
- middleware/auth requirements visible to clients

Runtime client config, server config, database details, and UI state do not belong in the shared contract.

## Structural vs business validation

Shared schemas should validate shape and structural constraints:

- required fields
- string/number/boolean types
- enums/literals
- non-empty strings when always structurally invalid
- payload nesting

Domain services should validate business invariants:

- uniqueness within a scope
- permission to perform operation
- lifecycle transition validity
- referenced entity existence when it has business meaning
- cross-module orchestration rules

Database constraints should protect persistence integrity and race conditions.

## Change classification

### Breaking

A change is breaking when an existing valid client call or expected response may no longer work.

Examples:

- field removed or renamed
- field type changed
- optional input becomes required
- output shape changed incompatibly
- route/method changed
- auth required where not required before
- error semantics changed in a way clients must handle differently

### Non-breaking

Examples:

- new endpoint
- optional input field added
- output field added when clients ignore unknown fields
- stricter server-side behavior that only rejects previously invalid business states
- docs/tests added

### Migration-required

Some changes are technically breaking but acceptable if performed with a migration plan:

- add replacement field while keeping old field temporarily
- support old and new endpoint for a deprecation window
- make new input optional first, then required later
- provide fallback behavior during rollout

## Consumer checklist

When changing a contract, review:

- server handlers
- domain services
- repositories if persistence shape changed
- webapp atoms
- webapp UI states/errors
- CLI commands
- tests and fixtures
- generated/openapi docs if applicable
- human docs under `docs/*`

## Error contracts

Expected domain failures should be typed errors in the shared contract when clients need to handle them.

Do not expose storage-specific errors as public API errors unless that is an intentional product contract.

Use error status intentionally:

- 400 for invalid request shape/semantics when appropriate
- 401 for missing/invalid auth
- 403 for authenticated but not allowed
- 404 for resource not found within valid scope
- 409 for conflicts such as duplicates or invalid lifecycle transitions when appropriate

## Docs checklist

`docs/api.md` should stay aligned with:

- endpoint list
- auth requirements
- important request/response shapes
- typed errors clients should handle
- examples for common flows
- contract evolution/migration notes when relevant
