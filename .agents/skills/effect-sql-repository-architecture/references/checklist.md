# Checklist

Before editing:

- [ ] Identify services with direct SQL or in-memory storage
- [ ] Identify domain errors currently raised
- [ ] Identify cross-service/domain dependencies
- [ ] Classify module relationships as ownership, scope, reference, orchestration, access policy, or shared context
- [ ] Identify transaction boundaries

Repository contracts:

- [ ] Contracts are storage-agnostic
- [ ] Contracts do not expose SQL rows
- [ ] Missing records return `null`
- [ ] Methods are named around data access, not use cases

SQL implementations:

- [ ] SQL code lives only in `modules/<module>/repository.sql.ts` or DB infra
- [ ] SQL repositories require `SqlClient.SqlClient`
- [ ] Row types are local
- [ ] Mappers are local
- [ ] SQL errors do not leak accidentally into domain service APIs
- [ ] Schema changes are numbered Effect SQL migrations registered in database infrastructure
- [ ] Demo seed data is separate from schema migrations

Domain services:

- [ ] No direct SQL queries
- [ ] No row types
- [ ] Domain errors remain here
- [ ] Business validations remain here
- [ ] Cross-repository orchestration remains here

Layer composition:

- [ ] DB layer provides SQL client
- [ ] Repository layer is provided DB layer
- [ ] Domain layer is provided repository layer
- [ ] HTTP handlers are provided domain dependencies
- [ ] No type casts to silence layer graph issues

Validation:

- [ ] Run backend check
- [ ] Run backend build
- [ ] Relevant docs updated if persistence architecture or relationship modeling changed
- [ ] Run smoke test if persistence changed
