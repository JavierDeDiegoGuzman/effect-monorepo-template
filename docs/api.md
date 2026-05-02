# API

## Overview

This template uses `effect/unstable/httpapi` as the shared contract between server and clients.

The API is defined once in `packages/shared` and then:

- implemented in `apps/server`
- consumed in `apps/webapp`
- exercised by server integration tests through `HttpApiClient`

## Where Things Live

### API root

- `packages/shared/src/api/Api.ts`

### API groups

- `packages/shared/src/api/groups/SystemApi.ts`
- `packages/shared/src/api/groups/TodosApi.ts`

### Domain schemas and errors

- `packages/shared/src/domain/Todo.ts`
- `packages/shared/src/domain/TodoErrors.ts`

### Server handlers

- `apps/server/src/http/handlers/System.ts`
- `apps/server/src/http/handlers/Todos.ts`

### Server service implementation

- `apps/server/src/services/Todos.ts`

### Clients

- webapp: `apps/webapp/src/api/client.ts`
- integration tests: `apps/server/src/http/HttpIntegration.test.ts`

## Current Endpoints

### System

- `GET /health`

### Todos

- `GET /todos`
- `GET /todos/:id`
- `POST /todos`
- `PATCH /todos/:id`

## How To Add A New Endpoint

Example workflow:

1. Add or update a domain schema in `packages/shared/src/domain`
2. Add the endpoint in the appropriate group under `packages/shared/src/api/groups`
3. Export the new group or schema if needed from `packages/shared/src/index.ts`
4. Implement the handler in `apps/server/src/http/handlers`
5. Add or extend the underlying service in `apps/server/src/services`
6. Use the typed client from the webapp or an integration test

## Why Typed Clients Matter Here

Clients are generated from the same `HttpApi` definition that the server implements.

That gives you:

- typed params
- typed payloads
- typed responses
- fewer contract mismatches between frontend, tests, and backend

## Runtime Separation

The API definition belongs in `shared`, but client runtime configuration does not.

For example:

- `packages/shared` defines the shape of the API
- `apps/webapp/src/api/client.ts` decides the browser base URL
- server integration tests use `NodeHttpServer.layerTest` to point `HttpApiClient` at an ephemeral test server

That separation is intentional and should be preserved as the template grows.
