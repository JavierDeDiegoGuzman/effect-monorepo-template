---
name: saas-auth-scope-architecture
description: Design and review SaaS authentication, tenant/account/workspace scoping, membership, roles/permissions, authorization boundaries, and cross-scope isolation. Use when adding protected APIs, scoped resources, workspace/account/tenant behavior, memberships, roles, permissions, or access tests.
---

# SaaS Auth and Scope Architecture

Use this skill when a change involves authenticated actors, tenant/account/workspace/organization scope, memberships, roles, permissions, or resource isolation.

This skill is general. A project may call the scope `tenant`, `account`, `workspace`, `organization`, `team`, `project`, or something else. Use the product's domain language, but keep the architecture explicit.

Read [references/auth-scope-rules.md](references/auth-scope-rules.md) before making changes.

## Goals

- Keep authentication, scope resolution, membership, and authorization distinct.
- Make scoped data access safe by default.
- Prevent cross-tenant/cross-scope data leaks.
- Keep authorization decisions explicit and testable.
- Avoid trusting client-provided scope or resource IDs without validation.

## Concepts

- Authentication: who the actor is.
- Scope context: which tenant/account/workspace/organization/project context the request is operating in.
- Membership/access grant: why the actor belongs to or can access the scope.
- Authorization: what the actor is allowed to do.
- Scoped resource: a resource that must only be read or mutated through its valid scope.

## Process

1. Identify whether the resource or operation is public, authenticated global, or scoped.
2. Identify the actor context required by the operation.
3. Identify the scope context required by the operation.
4. Decide how scope is resolved: token/session, header, route param, persisted preference, parent resource, or system context.
5. Validate membership/access before providing or trusting scope context.
6. Keep handlers responsible for context extraction and domain services responsible for business/access rules.
7. Ensure repositories/services include explicit scope for scoped resources.
8. Add 401/403/404 behavior intentionally.
9. Add cross-scope isolation tests.
10. Update docs when auth/scope behavior changes.

## Hard rules

- Do not treat authentication as authorization.
- Do not trust client-provided scope without membership/access validation.
- Do not fetch scoped resources by global ID alone.
- Do not leak whether a resource exists in another scope.
- Do not hide product authorization rules only inside SQL joins.
- Do not put product-specific authorization branching in generic auth middleware.
- Do not make every module depend on every other module when a shared scope/access context is the real boundary.
- Every new scoped module must include cross-scope isolation tests, or explicitly justify why they are not needed.

## Error semantics

- 401 Unauthorized: missing, invalid, or expired authentication.
- 403 Forbidden: authenticated actor is not allowed to perform the operation.
- 404 Not Found: resource does not exist inside the actor's valid scope, including resources that exist elsewhere.

## Documentation expectations

When applying this skill, update relevant docs if auth, scope resolution, membership, roles, permissions, protected routes, or error semantics change.

Typical docs:

- `docs/auth-scopes.md`
- `docs/api.md`
- `docs/architecture.md`
- `docs/testing.md`

## Output expectations

When applying this skill, report:

- actor/auth context used
- scope context used and how it is resolved
- membership/access validation performed
- authorization rule added or changed
- 401/403/404 behavior
- scoped service/repository methods added or changed
- cross-scope tests added
- docs updated
- validation commands run
