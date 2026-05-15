# TODO

- [ ] Migrate public and persisted IDs to UUID strings: define shared UUID schemas for contracts/API, update `User`/`Todo` models, `:id` params, SQL repositories, fixtures/tests, webapp atoms/UI, and API docs.
- [ ] Establish and document the canonical end-to-end error convention: typed domain errors (`TodoNotFound`, etc.), explicit HTTP status/body contracts in shared APIs, expected errors vs defects/500, SQL repository error policy, service/handler mapping, observability, and status tests.
- [x] Establish the canonical repository-as-port pattern: contracts in `repository.ts`, adapter selection by layer/entrypoint, infrastructure composition only in upper layers, and adapter tests.
- [ ] Remove JSON persistence completely; it is no longer a canonical adapter.
- [ ] Remove Drizzle completely; use Effect SQL and `SqlSchema` for SQLite/Postgres adapters.
- [ ] Deepen auth: move register/login/session verification rules behind `AuthService` so HTTP handlers stay thin adapters and password/JWT details stop leaking through user repository/module boundaries.
- [ ] Concentrate Effect layer assembly: remove duplicated module relationship knowledge from `ServerLayers.ts` and `DomainTestLayer.ts` by deepening the composition module used by production and tests.
- [x] Simplify todo creation UI: keep `TodoCreateForm` focused on global todo creation without parent-scoped selector props or noop callbacks.
- [ ] Extract shared SQL repository mechanics where they pass the deletion test: insert-result decoding, insert-then-read flow, row mapping conventions, and SQL failure policy currently repeat across SQL-compatible repository adapters.
- [ ] Revisit the transactions seam: either use `Transactions.withTransaction` for real multi-step atomic behavior or remove/defer the seam until it earns its interface.
- [ ] Concentrate webapp auth-token lifecycle: token storage, validation, clearing, and remote-state invalidation are split between `api/client.ts` and auth atoms.
- [ ] Align Storybook docs/story titles and add missing coverage for `RegisterForm` and `TodoCreateForm` behavior.
- [ ] Remove no-op handler `catchTag(... Effect.fail(error))` blocks once the canonical error policy is implemented.
- [ ] Validate route params explicitly so invalid UUID params decode as request errors instead of falling into generic not-found behavior.
