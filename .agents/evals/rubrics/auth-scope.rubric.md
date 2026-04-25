# Auth and Scope Rubric

Use for scenarios involving authentication, tenant/account/workspace/org scope, membership, roles, permissions, or scoped resources.

## Required checks

- [ ] Uses or clearly follows `saas-auth-scope-architecture`.
- [ ] Distinguishes authentication, scope context, membership/access grant, and authorization.
- [ ] Scope resolution strategy is explicit.
- [ ] Client-provided scope is validated or not trusted.
- [ ] Scoped resources are not fetched by global ID alone.
- [ ] Services/repositories include explicit scope for scoped resources.
- [ ] 401/403/404 behavior is intentional.
- [ ] Cross-scope existence is not leaked.
- [ ] Product-specific permission checks are not buried in generic auth middleware.
- [ ] Cross-scope isolation tests are added or absence is explicitly justified.
- [ ] Docs are updated or absence is explicitly justified.

## Fail conditions

- Authenticated user treated as automatically authorized.
- Scoped resource loaded by global ID only.
- Payload scope used directly without validation.
- Returning errors that reveal resources in another scope.
- No cross-scope tests or justification for a scoped resource.

## Scoring suggestion

- auth/scope separation: 20
- scoped data access: 25
- authorization/error semantics: 20
- tests: 20
- docs/final reporting: 15
