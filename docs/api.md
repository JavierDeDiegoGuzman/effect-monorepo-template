# API

## Overview

This template uses `effect/unstable/httpapi` as the shared contract between server and clients.

The API is defined once in `packages/shared`, implemented in `apps/server`, consumed in `apps/webapp`, and exercised by server integration tests through `HttpApiClient`.

Most product endpoints are protected by bearer-token authorization. Register or log in first, then send the returned access token as `Authorization: Bearer <token>`.

## Where Things Live

### API root

- `packages/shared/src/api.ts`

### Shared modules

- `packages/shared/src/modules/system/api.ts`
- `packages/shared/src/modules/auth/api.ts`
- `packages/shared/src/modules/auth/contract.ts`
- `packages/shared/src/modules/auth/errors.ts`
- `packages/shared/src/modules/auth/middleware.ts`
- `packages/shared/src/modules/users/schema.ts`
- `packages/shared/src/modules/users/errors.ts`
- `packages/shared/src/modules/todos/schema.ts`
- `packages/shared/src/modules/todos/contract.ts`
- `packages/shared/src/modules/todos/errors.ts`

Each module exports its public surface from `index.ts`; root `@app/shared` exports the API root and module indexes.

### Server modules

- product handlers/services/repositories: `apps/server/src/modules/<module>/*`
- HTTP server setup and middleware: `apps/server/src/http/*`
- runtime layer composition: `apps/server/src/layers/*`
- SQLite client/schema/transactions: `apps/server/src/database/*`
- observability setup/config: `apps/server/src/observability/*`

### Clients

- webapp typed client runtime: `apps/webapp/src/api/client.ts`
- integration tests: `apps/server/src/test/integration/http.test.ts`

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

## How To Add A New Endpoint

1. Add or update shared schemas/contracts/errors/API under `packages/shared/src/modules/<module>`.
2. Export the public contract from the module `index.ts` and root `packages/shared/src/index.ts` if needed.
3. Implement or extend server repository/service/handler files under `apps/server/src/modules/<module>`.
4. Wire production and test layers through module indexes.
5. Consume the contract from webapp atoms or integration tests through `@app/shared` and the typed client.
6. Update docs and architecture checks when module boundaries change.

## Why Typed Clients Matter Here

Clients are generated from the same `HttpApi` definition that the server implements, giving typed params, payloads, responses, and contract mismatch detection across frontend, tests, and backend.
