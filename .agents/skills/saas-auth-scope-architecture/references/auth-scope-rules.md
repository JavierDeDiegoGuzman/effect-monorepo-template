# Auth and Scope Rules

## Separate four questions

### Authentication

Who is the actor?

Examples:

- bearer token identifies a user
- session identifies an account actor
- service token identifies an internal system actor

### Scope context

Where is the operation happening?

Examples:

- tenant
- account
- workspace
- organization
- team
- project
- installation

### Membership or access grant

Why may this actor enter that scope?

Examples:

- user is a workspace member
- service account belongs to an organization
- user has project access through a team

### Authorization

What may the actor do?

Examples:

- create project
- manage billing
- invite members
- read audit logs

Do not collapse these into one generic boolean.

## Layer responsibilities

### Auth middleware

Owns:

- credential extraction
- token/session verification
- actor loading
- generic scope resolution when applicable
- membership validation needed to provide scope context
- providing context services to handlers

Must not own:

- product-specific business rules
- per-module permission branching
- repository queries unrelated to auth/scope context

### Handlers

Own:

- requiring auth middleware where needed
- reading provided actor/scope context
- passing explicit context to domain services
- mapping transport errors

Must not:

- trust payload scope without validation
- call repositories directly
- implement complex permission logic inline

### Domain/access services

Own:

- business authorization rules
- role/permission checks
- relationship validation
- converting missing scoped resources to NotFound
- orchestration across repositories/services

### Repositories

Own:

- scoped persistence queries
- storage mapping
- constraints/indexes that protect scoped access and uniqueness

For scoped resources, repository contracts should make scope explicit. The exact name should match the product language:

```ts
readonly getByIdInTenant: (tenantId: TenantId, id: ResourceId) => Effect.Effect<Resource | null>
readonly listByAccount: (accountId: AccountId) => Effect.Effect<ReadonlyArray<Resource>>
readonly createForOrganization: (organizationId: OrganizationId, input: CreateRecord) => Effect.Effect<Resource>
```

## Scope resolution patterns

### Token/session scope

The token/session includes the active scope.

Pros:

- simple request handling
- explicit context per credential

Cons:

- switching scope may require session/token refresh
- membership changes may require invalidation strategy

### Header scope

The client sends a header such as `X-Scope-Id`.

Pros:

- flexible switching
- good for multi-workspace/multi-account UIs

Cons:

- every client must send it
- middleware must validate membership every time or through a safe cache

### Route parent scope

The route includes parent context, such as `/organizations/:orgId/projects`.

Pros:

- explicit URLs
- natural for nested resources

Cons:

- requires consistent route design
- must validate access to parent scope

### Parent-resource derived scope

The target resource determines scope.

Pros:

- useful for deeply nested operations

Cons:

- must avoid global ID leaks
- often requires scoped lookup or access-controlled lookup

## 401 / 403 / 404

Use 401 for missing/invalid auth.

Use 403 when the actor is authenticated but lacks permission for an operation or scope.

Use 404 when a resource is not found within the actor's valid scope. If a resource exists in another scope, the actor should usually still see NotFound, not Forbidden.

## Tests

For each scoped module, add cross-scope tests:

```txt
actor A + scope 1
actor B + scope 2
resource 1 in scope 1
resource 2 in scope 2
```

Assert:

- actor A lists only scope 1 resources
- actor A cannot get resource 2
- actor A cannot update/delete resource 2
- missing within scope returns NotFound
- lack of permission returns Forbidden
- missing/invalid auth returns Unauthorized

## Anti-patterns

- `getById(id)` for scoped resources where `id` can be guessed or enumerated
- accepting `scopeId` from payload and using it directly
- returning Forbidden for resources outside the scope when it leaks existence
- copying role checks into many handlers
- embedding product permission rules only in SQL joins
- making auth middleware know every product module
