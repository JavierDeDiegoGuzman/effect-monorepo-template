# API

## Overview

This template uses `effect/unstable/httpapi` as the shared contract between server and clients.

The API is defined once in `packages/shared` and then:

- implemented in `apps/server`
- consumed in `apps/webapp`
- exercised by server integration tests through `HttpApiClient`

Most product endpoints are protected by bearer-token authorization. Register or log in first, then send the returned access token as `Authorization: Bearer <token>`.

## Where Things Live

### API root

- `packages/shared/src/api/Api.ts`

### API groups

- `packages/shared/src/api/groups/SystemApi.ts`
- `packages/shared/src/api/groups/AuthApi.ts`
- `packages/shared/src/api/groups/ProjectsApi.ts`
- `packages/shared/src/api/groups/TodosApi.ts`

### Domain schemas and errors

- `packages/shared/src/domain/Auth.ts`
- `packages/shared/src/domain/User.ts`
- `packages/shared/src/domain/Workspace.ts`
- `packages/shared/src/domain/Project.ts`
- `packages/shared/src/domain/ProjectErrors.ts`
- `packages/shared/src/domain/Todo.ts`
- `packages/shared/src/domain/TodoErrors.ts`

### Server handlers and services

- handlers: `apps/server/src/http/handlers/*`
- services: `apps/server/src/services/*`
- repositories: `apps/server/src/repositories/*`
- SQLite infrastructure: `apps/server/src/infra/sql/*`

### Clients

- webapp: `apps/webapp/src/api/client.ts`
- integration tests: `apps/server/src/http/HttpIntegration.test.ts`

## Current Endpoints

### System

- `GET /health` (public)

### Auth

- `POST /auth/register` (public)
- `POST /auth/login` (public)
- `GET /auth/me` (protected)

### Projects (protected)

- `GET /projects`
- `GET /projects/:id`
- `POST /projects`
- `PATCH /projects/:id`
- `POST /projects/:id/archive`

### Todos (protected)

- `GET /todos`
- `GET /projects/:projectId/todos`
- `GET /todos/:id`
- `POST /todos`
- `PATCH /todos/:id`

Todos can optionally belong to a project. Project-scoped reads use `/projects/:projectId/todos`.

## How To Add A New Endpoint

Example workflow:

1. Add or update a domain schema in `packages/shared/src/domain`
2. Add the endpoint in the appropriate group under `packages/shared/src/api/groups`
3. Export the new group or schema if needed from `packages/shared/src/index.ts`
4. Implement or extend repository contracts and persistence if the endpoint stores data
5. Implement or extend the underlying service in `apps/server/src/services`
6. Implement the handler in `apps/server/src/http/handlers`
7. Use the typed client from the webapp or an integration test

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
