# TODO

- [ ] Migrar los IDs públicos y persistidos a strings UUID: definir schemas compartidos de UUID para contratos/API, actualizar modelos `User`/`Todo`, params `:id`, repositorios SQL, fixtures/tests, webapp atoms/UI y documentación de API.
- [ ] Establecer y documentar la convención canónica de errores end-to-end: errores de dominio tipados (`TodoNotFound`, etc.), status/body HTTP explícitos en contratos compartidos, distinción entre errores esperados y defects/500, política de errores de repositorios SQL, mapeo en services/handlers, observabilidad y tests de status.
- [ ] Establecer y documentar el patrón canónico para repositorios SQL: contratos en `repository.ts`, implementaciones SQL usando `SqlClient.SqlClient`, composición de `SqliteLayer` solo en capas superiores, política de errores, helpers compartidos/convenciones para inserts, scopes y tests.
- [ ] Deepen auth: move register/login/session verification rules behind an auth-focused seam so HTTP handlers stay thin Adapters and password-hash details stop leaking through the Users Module Interface.
- [ ] Concentrate Effect layer assembly: remove duplicated module relationship knowledge from `ServerLayers.ts` and `DomainTestLayer.ts` by deepening the composition Module used by production and tests.
- [x] Simplify todo creation UI: keep `TodoCreateForm` focused on global todo creation without parent-scoped selector props or noop callbacks.
- [ ] Extract shared SQL repository mechanics where they pass the deletion test: insert-result decoding, insert-then-read flow, row mapping conventions, and SQL failure policy currently repeat across auth/session and todo repository Adapters.
- [ ] Revisit the transactions seam: either use `Transactions.withTransaction` for real multi-step atomic behaviour or remove/defer the seam until it earns its Interface.
- [ ] Concentrate webapp auth-token lifecycle: token storage, validation, clearing, and remote-state invalidation are split between `api/client.ts` and auth atoms.
- [ ] Align Storybook docs/story titles and add missing coverage for `RegisterForm` and `TodoCreateForm` behavior.
- [ ] Remove no-op handler `catchTag(... Effect.fail(error))` blocks once the canonical error policy is documented.
- [ ] Validate route params explicitly instead of letting invalid numeric params become `NaN` and fall into generic not-found behavior.
