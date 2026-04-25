# Checklist

Before writing tests:

- [ ] Identify the layer under test
- [ ] Identify required dependencies
- [ ] Decide in-memory vs temporary SQL dependencies
- [ ] Identify seed/fixture data
- [ ] Identify transaction needs

In-memory repository tests:

- [ ] In-memory repositories implement production repository contracts
- [ ] State is scoped per test layer instance
- [ ] Fixtures use domain entities or repository DTOs, not SQL rows
- [ ] Missing records match production contract behavior
- [ ] `InMemoryTransactionsLayer` is provided if domain service uses transactions

Temporary SQL tests:

- [ ] Test DB is temporary and isolated
- [ ] Schema initializer is shared with production infra
- [ ] Seed is explicit: enabled or disabled per test
- [ ] SQL repositories are provided with test SQL client
- [ ] No production/dev DB path is used

Domain service tests:

- [ ] Domain service is tested with repository contracts
- [ ] Business errors are asserted
- [ ] Normalization/validation is asserted where relevant
- [ ] No SQL row shapes leak into domain tests
- [ ] Domain service does not depend directly on SQL

Repository integration tests:

- [ ] SQL queries are exercised against real temporary DB
- [ ] Insert/update/list/get behavior is tested
- [ ] Row-to-domain mapping is tested
- [ ] Constraints or missing rows are tested where relevant

Layer composition:

- [ ] Test layers are explicit
- [ ] No broad casts hide unresolved dependencies
- [ ] Service-to-service dependencies are composed in the correct order
- [ ] Transaction abstraction is provided

Validation:

- [ ] Run backend check
- [ ] Run backend tests
- [ ] Run backend build
- [ ] Run a smoke test if runtime wiring changed
