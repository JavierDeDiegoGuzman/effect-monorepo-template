# Code Context

## Files Retrieved
1. `todo.md` (lines 1-15) - current architectural backlog and explicit open seams.
2. `docs/architecture.md` (lines 1-96) - intended module layout, dependency rules, repository Adapter policy, and runtime layer selection.
3. `docs/testing.md` (lines 1-70) - current testing philosophy and gaps around HTTP/status and Postgres integration coverage.
4. `docs/api.md` (lines 1-66) - API contract locations and endpoint inventory.
5. `apps/server/src/modules/users/repository.ts` (lines 1-20) - Users repository Interface exposes `passwordHash` auth record.
6. `apps/server/src/modules/todos/repository.ts` (lines 1-22) - Todos repository port shape and current `number` IDs.
7. `apps/server/src/modules/auth/handlers.ts` (lines 1-95) - auth HTTP handlers contain registration/login domain rules and password/token orchestration.
8. `apps/server/src/modules/users/service.ts` (lines 1-20) - Users Module Interface leaks auth credential record into service consumers.
9. `apps/server/src/layers/ServerLayers.ts` (lines 1-98) - production/dev layer assembly duplicates module relationship knowledge.
10. `apps/server/src/test/layers/DomainTestLayer.ts` (lines 1-33) - test layer assembly repeats production domain composition.
11. `packages/shared/src/modules/todos/api.ts` (lines 13-52) - todo params use `Schema.NumberFromString`; not-found response currently no-content.
12. `packages/shared/src/modules/todos/errors.ts` (lines 1-8) - `TodoNotFound` lacks explicit HTTP status/body convention.
13. `apps/server/src/modules/todos/handlers.ts` (lines 24-65) - no-op `catchTag(... Effect.fail(error))` blocks and thin transport boundary examples.
14. `apps/server/src/modules/todos/repository.drizzle.postgres.ts` (lines 8-84) - Drizzle Adapter row mapping, `orDie` SQL policy, insert-return decoding.
15. `apps/server/src/modules/users/repository.drizzle.postgres.ts` (lines 8-86) - same Drizzle mechanics repeated in Users Adapter.
16. `apps/server/src/modules/todos/repository.sql.ts` (lines 6-98) - raw SQL/SQLite Adapter repeats insert-result decoding and insert-then-read flow.
17. `apps/server/src/database/transactions.ts` (lines 1-10) and `apps/server/src/database/transactions.sql.ts` (lines 1-15) - transaction seam exists as a generic Interface.
18. `apps/webapp/src/api/client.ts` (lines 1-65) - API client Adapter owns token read/validation/clear before bearer injection.
19. `apps/webapp/src/modules/auth/atoms.ts` (lines 18-80) - auth atoms duplicate token validation/clear and own remote invalidation keys.
20. `apps/server/src/test/integration/http.test.ts` (lines 43-87) - current black-box HTTP coverage covers happy path only.

## Key Code

### P0/P1 backlog already points to high-leverage seams
`todo.md` lines 3-15 identify the main unfinished architecture work: UUID IDs, canonical errors, deeper auth seam, concentrated layer composition, shared SQL repository mechanics, transaction seam decision, webapp token lifecycle, status tests/docs.

### Repository ports are clean, but Adapter error policy is implicit
```ts
// apps/server/src/modules/todos/repository.ts:4-22
export class TodosRepository extends Context.Service<
  TodosRepository,
  {
    readonly listByUser: (userId: number) => Effect.Effect<Array<Todo>>
    readonly getByIdForUser: (userId: number, id: number) => Effect.Effect<Todo | null>
    readonly createForUser: (...) => Effect.Effect<Todo>
    readonly updateCompletedForUser: (...) => Effect.Effect<void>
  }
>()("app/modules/todos/TodosRepository") {}
```
Adapters generally convert SQL failures to defects with `Effect.orDie` (`repository.drizzle.postgres.ts` lines 23-28, 37-42, 51-55, 70-74; `repository.sql.ts` lines 36-41, 48-53, 62-65, 84-88). That may be intentional, but it is not yet a documented Interface policy.

### Auth rules are too shallow/local to HTTP handlers
`apps/server/src/modules/auth/handlers.ts` lines 23-69 hash passwords, create users with `passwordHash`, look up `UserRecord`, verify passwords, sign tokens, and shape `InvalidCredentials`. `apps/server/src/modules/users/service.ts` lines 5-18 makes `passwordHash` part of the Users service Interface. This lowers Module depth: auth details leak across Modules and handlers stop being pure transport Adapters.

### Layer composition duplicates Module relationship knowledge
`ServerLayers.ts` lines 32-61 manually assembles every repository Adapter variant and lines 67-87 merge `UsersLive`, `TodosLive`, auth tokens, passwords. `DomainTestLayer.ts` lines 16-33 repeats `UsersLive` + `TodosLive` domain assembly. This is a locality problem: adding a Module requires editing multiple composition sites.

### Errors/params are inconsistent and under-tested
`packages/shared/src/modules/todos/api.ts` lines 18-27 and 33-43 decode `:id` with `Schema.NumberFromString` and expose `TodoNotFound` as no-content with synthetic `id: -1`. `TodoNotFound` itself has no explicit status metadata (`errors.ts` lines 3-8). Handlers rethrow unchanged errors (`handlers.ts` lines 34-36, 62-64). `http.test.ts` lines 52-87 only verifies a happy-path register/create/list flow, so status/body contracts for invalid auth, duplicate users, invalid params, and not-found are not pinned.

## Architecture

Prioritized opportunities:

1. **P0 - Canonical error policy across Interface seams.** Define expected domain errors vs repository/SQL defects, explicit shared HTTP status/body shape, and handler mapping rules. This has high leverage because it affects shared contracts, server Modules, observability, tests, and docs. Start with `TodoNotFound`, `UserAlreadyExists`, `InvalidCredentials`, `Unauthorized`, invalid route params, and SQL failures currently hidden by `orDie`.

2. **P0 - Deepen auth Module Interface.** Add an auth-focused service seam such as `AuthSessions`/`Authenticator` so register/login/session verification live behind a Module Interface. HTTP handlers should only adapt payloads to service calls. Users should not expose `passwordHash` to arbitrary service consumers; credential storage can stay in a repository Adapter or an auth-owned port. This improves depth and locality by concentrating password/token rules.

3. **P1 - Concentrate layer composition into a reusable composition Module.** Move `UsersLive` + `TodosLive` + repository Adapter variant knowledge out of both `ServerLayers.ts` and `DomainTestLayer.ts`. A single domain composition seam can export production, dev, memory, JSON, SQLite, and Postgres variants. This reduces Adapter wiring churn when adding Modules.

4. **P1 - Establish SQL repository mechanics/policy.** Drizzle and SQL Adapters repeat row mapping, select-one/null conventions, insert-return or insert-then-read decoding, and `orDie` policy. Extract only helpers that pass the deletion test, likely under `database` or a repository-support Module, not inside product Modules. Keep domain repository Interfaces storage-agnostic.

5. **P1 - Decide transaction seam fate.** `Transactions.withTransaction` exists (`transactions.ts` lines 3-10) and SQL implements it (`transactions.sql.ts` lines 5-15), but the inspected service flows do not use it for multi-step atomic behavior. Either deepen it by applying it to real cross-repository workflows, or remove/defer it to avoid a shallow Interface.

6. **P1/P2 - UUID public/persisted IDs.** Current shared schemas and repository ports use `number` IDs (`User`, `Todo`, todo params, token subject parsing). Migrating to UUID strings is broad but aligns API stability and database locality. Do this after or alongside error/param policy so invalid UUIDs produce deliberate contract errors.

7. **P2 - Concentrate webapp auth-token lifecycle.** Token storage validation/clearing appears both in API client bearer middleware (`api/client.ts` lines 26-41) and auth atoms (`auth/atoms.ts` lines 18-39). A small auth-session client Adapter could own read/validate/clear/write and expose reactivity invalidation consistently.

8. **P2 - Expand black-box tests and docs.** Current HTTP integration has one happy path. Add contract-level tests for 401 missing/invalid token, 409 duplicate register, 404 todo not found, invalid params, and expected response bodies. Update `docs/api.md`, `docs/testing.md`, and `docs/architecture.md` when policy is finalized.

## Start Here
Open `todo.md` first for prioritization, then `apps/server/src/modules/auth/handlers.ts` for the highest-leverage depth/locality improvement: extracting auth rules behind an auth Module Interface will also clarify Users repository policy, errors, layer composition, and HTTP tests.
