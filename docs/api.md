# API

## Overview

This template uses `effect/unstable/httpapi` as the shared contract between server and clients.

The API is defined once in `packages/shared`, implemented in `apps/server`, consumed by clients through a typed API client, and exercised by server e2e tests through that same contract.

Most product endpoints are protected by bearer-token authorization. Register or log in first, then send the returned access token as `Authorization: Bearer <token>`.

## Where Things Live

### API root

- `packages/shared/src/api.ts`

### Shared modules

Shared modules live under `packages/shared/src/modules/<module>` and use this layout:

- `schema.ts`: primary schemas and branded UUID IDs.
- `contract.ts`: request/response DTOs.
- `errors.ts`: typed expected public errors.
- `api.ts`: `HttpApiGroup` endpoints with explicit success and error contracts.
- `middleware.ts`: shared middleware contracts when needed.
- `index.ts`: module public exports.

Current modules include:

- `system`
- `auth`
- `users`
- `todos`

Root `@app/shared` exports the API root and module indexes.

### Server modules

- product handlers/services/repositories: `apps/server/src/modules/<module>/*`
- HTTP server setup and middleware: `apps/server/src/http/*`
- runtime layer composition: `apps/server/src/layers/*`
- SQL clients/schema lifecycle: `apps/server/src/database/*` or `apps/server/src/persistence/*`
- observability setup/config: `apps/server/src/observability/*`

### Clients

Canonical client target:

- `packages/api-client`: runtime-neutral typed API client built from `packages/shared`.

Runtime adapters:

- `apps/webapp/src/api/*`: browser/webapp adapter around the base client, including browser token lifecycle.
- `apps/server/src/test/*`: e2e test harness using injected fetch from the fetchable app.

During migration, the webapp may still contain local typed client construction. New work should move toward `packages/api-client`.

## Current Endpoints

### System

- `GET /health` (public)

### Auth

- `POST /auth/register` (public)
- `POST /auth/login` (public)
- `GET /auth/me` (protected)

### Todos (protected)

- `GET /todos`
- `GET /todos/:id`
- `POST /todos`
- `PATCH /todos/:id`

Todos are global per authenticated user in the current template example.

## Public ID Policy

Public and persisted entity IDs should be branded UUID strings, for example `UserId` and `TodoId`.

Rules:

- shared schemas define branded ID types;
- route params use branded ID schemas, not number parsing;
- services generate IDs inline with `Random.nextUUIDv4` and decode/brand them before use;
- repositories receive IDs from services and never generate IDs;
- JWT `sub` is a validated `UserId` UUID.

Invalid ID params should fail request decoding as 400-level input errors. They should not become `NaN`, empty strings, or generic not-found behavior.

## Public Error Policy

Expected client-visible failures are shared contract errors. They live in module `errors.ts` files and are declared on endpoints with explicit HTTP statuses and safe response bodies.

Examples:

- `TodoNotFound` -> 404
- `UserAlreadyExists` -> conflict status chosen by the auth contract
- `InvalidCredentials` -> auth failure status chosen by the auth contract
- `Unauthorized` -> 401
- `InternalServerError` -> 500 safe generic body

Persistence, SQL, decode, and other internal server failures are not exposed directly. Handlers map them to the shared safe `InternalServerError` unless a service has intentionally converted the situation into an expected domain error.

## Backend Implementation Rule

Every endpoint follows the canonical backend flow:

```text
HTTP handler -> Service/use-case Module -> Repository Interface -> Adapter
```

Handlers adapt transport only. They must not call repositories directly. Services own product decisions and return/raise expected domain errors. Repositories are flat query adapters and surface internal persistence failures.

## How To Add A New Endpoint

1. Add or update shared schemas, branded IDs, contracts, errors, and API definitions under `packages/shared/src/modules/<module>`.
2. Export the public contract from the module `index.ts` and root `packages/shared/src/index.ts` if needed.
3. Define repository inputs/records and the repository interface in `apps/server/src/modules/<module>/repository.ts` if persistence is needed.
4. Implement memory, SQLite, and Postgres repository adapters as needed.
5. Implement or extend the service/use-case module.
6. Implement handlers that call the service only.
7. Wire production and test layers through module indexes.
8. Consume the contract from webapp atoms or e2e tests through the typed API client.
9. Update docs and architecture checks when module boundaries change.

## Why Typed Clients Matter Here

Clients are generated from the same `HttpApi` definition that the server implements, giving typed params, payloads, responses, and contract mismatch detection across frontend, tests, and backend.

The base typed client is runtime-neutral. Browser token storage, logout behavior, and UI reaction to 401s belong to the webapp adapter/atoms, not the base client package.
