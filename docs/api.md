# API

## Overview

This template uses `effect/unstable/httpapi` as the shared contract between server and clients.

The API is defined once in `packages/shared`, implemented by HTTP handlers in `apps/server`, consumed by clients through a typed API client, and exercised by server e2e tests through that same contract. The backend package split is an internal refactor: the public API contract, endpoint paths, payloads, responses, and typed errors did not change.

Most product endpoints are protected by the web session cookie. Register or log in first; the server sets an HttpOnly `app_session` cookie, and browser clients send it with subsequent requests.

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

### Backend implementation

- public API contracts: `packages/shared/src/modules/<module>/*`
- domain/application services, repository ports, storage-agnostic errors, transaction contract, and in-memory domain test support: `packages/backend-domain/src/*`
- database config/connections, Effect SQL migrations, seed/CLI commands, SQL/Postgres repository adapters, live password/token services, and SQL test layers: `packages/backend-infra/src/*`
- HTTP handlers and transport adapters: `apps/server/src/modules/<module>/*`
- auth cookies/session transport adapter: `apps/server/src/modules/auth/session-cookie.ts`
- HTTP server setup and middleware: `apps/server/src/http/*`
- runtime layer composition: `apps/server/src/layers/*`
- observability setup/config: `apps/server/src/observability/*`

### Clients

Runtime adapters create typed clients directly from the `packages/shared` API contract:

- `apps/webapp/src/api/*`: browser/webapp adapter, including cookie credentials behavior.
- `apps/server/src/test/*`: integration and smoke harnesses using injected fetch implementations.

This template intentionally does not include a separate API client package. Keep client construction thin and runtime-local unless the project explicitly chooses to add one later.

## Current Endpoints

### System

- `GET /health` (public)

### Auth

- `POST /auth/register` (public)
- `POST /auth/login` (public; sets session cookie)
- `POST /auth/logout` (public; clears session cookie)
- `GET /auth/me` (protected by session cookie)

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

Expected client-visible failures are shared contract errors. Module-specific errors live in module `errors.ts` files. Cross-cutting public errors such as `InternalServerError` live in `packages/shared/src/errors.ts`. Endpoint `api.ts` files declare every public error with explicit HTTP statuses and safe response bodies.

If a client or UI should branch on an error, render custom copy for it, retry it differently, redirect because of it, or show an inline validation state for it, the error must be a shared typed contract error. Do not use generic `Error`, string failures, ad-hoc `Effect.fail` values, or `Effect.orDie` for user-manageable failures.

Public domain error messages are fixed with schema constructor defaults. Call sites construct errors with semantic data only, for example `new TodoNotFound({ id })`; they do not choose user-facing copy. Structural validation errors remain the built-in Effect HttpApi/schema validation errors and do not guarantee fixed user-facing messages.

Examples:

- `TodoNotFound` -> 404 with fixed message and a JSON body containing the missing `id`
- `UserAlreadyExists` -> 409 with fixed message and the conflicting normalized `email`
- `InvalidCredentials` -> 401 with fixed generic message
- `Unauthorized` -> 401 with fixed generic message
- `InternalServerError` -> 500 with fixed safe generic message

Repository failures use the server-only `RepositoryError` and are not exposed directly. Services propagate repository failures alongside expected domain errors. Handlers use the HTTP error mapping seam to convert `RepositoryError` and unexpected defects to the shared safe `InternalServerError` unless a service has intentionally converted the situation into an expected domain error.

## Backend Implementation Rule

Every endpoint follows the canonical backend flow:

```text
HTTP handler -> Service/use-case Module -> Repository Interface -> Adapter
```

Handlers adapt transport only. They must not call repositories directly. Services own product decisions and return/raise expected domain errors. Repositories are flat query adapters and surface internal persistence failures.

## How To Add A New Endpoint

1. Add or update shared schemas, branded IDs, contracts, errors, and API definitions under `packages/shared/src/modules/<module>`.
2. Export the public contract from the module `index.ts` and root `packages/shared/src/index.ts` if needed.
3. Define repository inputs/records and the repository interface in `packages/backend-domain/src/modules/<module>/repository.ts` if persistence is needed.
4. Implement memory adapters in `packages/backend-domain` and SQLite/Postgres adapters in `packages/backend-infra` as needed.
5. Add numbered Effect SQL migrations under `packages/backend-infra/src/database/migrations/*` for schema changes, keeping demo seed data separate.
6. Implement or extend the service/use-case module in `packages/backend-domain`.
7. Implement handlers in `apps/server` that call the service only.
8. Wire production and test layers through package/module indexes and `apps/server/src/layers/ServerLayers.ts`.
9. Consume the contract from webapp atoms or e2e tests through the typed API client.
10. Update docs and architecture checks when module boundaries change.

## Why Typed Clients Matter Here

Clients are generated from the same `HttpApi` definition that the server implements, giving typed params, payloads, responses, and contract mismatch detection across frontend, tests, and backend.

The base typed client layer is runtime-neutral. Browser cookie transport, logout behavior, and UI reaction to 401s belong to the webapp adapter/atoms, not a shared client package.
