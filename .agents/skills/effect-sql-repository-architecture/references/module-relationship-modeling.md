# Module Relationship Modeling

Before adding a persisted relationship between modules, classify the relationship. Do not add direct module coupling merely because two tables can be joined.

## Relationship types

### Ownership

One module/entity owns the lifecycle of another.

Signals:

- child cannot exist without parent
- parent deletion usually deletes or archives child
- parent controls creation and lifecycle

Persistence options:

- foreign key from child to parent
- cascade or restricted delete, chosen intentionally
- parent-scoped unique constraints

Service design:

- owner domain may orchestrate child lifecycle
- avoid making unrelated modules depend on owner internals

### Containment / scope

A resource lives inside a broader product context such as tenant, account, workspace, organization, project, or installation.

Signals:

- queries and permissions are evaluated inside that context
- uniqueness is often scoped to that context
- many modules share the same context

Persistence options:

- explicit scope column
- scoped indexes and unique constraints
- access/membership tables when users enter through that context

Service design:

- pass scope explicitly through domain/repository operations
- do not couple every scoped module directly to every other scoped module
- consider a shared context/access module

### Reference

One module points at another but does not own it.

Signals:

- referenced entity has its own lifecycle
- deleting referenced entity may restrict, null out, archive, or require reassignment
- referencing module should not implement referenced module's business rules

Persistence options:

- foreign key when integrity should be enforced
- nullable reference when product behavior allows detaching
- denormalized label/snapshot if historical display matters

Service design:

- validate reference existence in domain service when it has business meaning
- avoid repository-to-repository calls

### Orchestration

A use case coordinates several modules.

Signals:

- multi-step workflow
- several writes must be atomic
- no single repository owns the whole behavior

Persistence options:

- normal module tables plus transaction boundary
- outbox/event table if asynchronous integration is needed

Service design:

- use a domain/application service to orchestrate
- use transaction abstraction for atomic writes
- do not push orchestration into SQL repositories or handlers

### Access policy

The relationship exists to decide who can do what.

Signals:

- membership, roles, grants, permissions, ownership claims
- answers authorization questions rather than data lifecycle questions

Persistence options:

- membership/access tables
- role/permission assignment tables
- audit log or policy tables when needed

Service design:

- keep access checks explicit and testable
- avoid hiding permission decisions inside SQL joins only
- use a dedicated access/policy service when rules grow

### Shared context

Several modules share the same enclosing context.

Signals:

- many modules are scoped by the same tenant/account/workspace/etc.
- coupling each module to each other would create a mesh

Persistence options:

- common context identifier across tables
- common membership/access tables
- scoped indexes

Service design:

- depend on the shared context/access boundary, not on unrelated modules
- keep module APIs focused on their own domain behavior

## Design rules

- Database relationships and domain relationships are related but not identical.
- A foreign key does not automatically imply a domain service dependency.
- A SQL join does not automatically imply a module boundary.
- Business relationship rules should not live only in database constraints.
- Use constraints to protect invariants, but keep domain meaning in domain services.
- Prefer shared context boundaries over pairwise coupling when several modules share the same scope.

## Decision output

When adding a relationship, state:

```txt
Relationship: <module A> -> <module B>
Classification: ownership | containment/scope | reference | orchestration | access policy | shared context
Persistence representation: FK | nullable FK | join table | scope column | event/outbox | denormalized snapshot | none
Domain validation: which service validates what
Transaction needs: none | required | future event/outbox
Deletion behavior: restrict | cascade | set null | archive | not applicable
Access implications: none | checked by access service | checked by domain service
```
