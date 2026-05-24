# Code Context

This repository is an Effect-first full-stack SaaS template. The product example currently includes auth/session, users, and todos.

## Current architecture facts

- Shared contracts live in `packages/shared/src/modules/*` and are implemented by the server and consumed by typed clients.
- Public/persisted IDs are branded UUID strings:
  - `UserId` in `packages/shared/src/modules/users/schema.ts`
  - `TodoId` in `packages/shared/src/modules/todos/schema.ts`
- Auth is web-first and cookie-backed:
  - public auth responses do not expose tokens;
  - HTTP-only `app_session` cookie handling lives in the HTTP/session adapter;
  - `AuthService` owns register/login/session verification behavior and remains transport-agnostic.
- Credentials are separate from public users:
  - auth credentials are stored behind `AuthCredentialsRepository`;
  - `Users` exposes public user behavior and does not expose password hashes.
- Canonical persistence adapters are memory, SQLite, and Postgres.
- JSON and Drizzle persistence are removed from the product/runtime template.
- Repository adapters surface server-only `RepositoryError`; HTTP handlers map infra defects/errors to public `InternalServerError` through `withHttpErrorMapping`.
- UI-manageable errors are shared typed public errors declared on `HttpApi` endpoints.
- Layer composition is centralized in `apps/server/src/layers/ServerLayers.ts`:
  - repository families are composed once;
  - product domain composition is separated from full auth/application domain composition;
  - test layer files re-export or adapt the canonical composition helpers.

## Remaining architectural opportunities

1. Extract shared SQL repository mechanics only where they pass the deletion test.
2. Revisit the transactions seam as more multi-repository workflows appear.
3. Add more architecture checks for handler/repository import rules, repository ID generation, and UUID-only public IDs.
4. Revisit a runtime-neutral API client package only if additional runtimes create enough duplication to justify a real seam. For now, typed client construction stays runtime-local.
