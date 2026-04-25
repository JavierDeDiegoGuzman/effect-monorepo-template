# Scenario: Add a Scoped Product Module

## Task prompt

```txt
Add an invoices module scoped to an account. Users can list invoices for the current account and get invoice details. A user must never see invoices from another account.
```

## Expected skills

- `product-module-expansion`
- `saas-auth-scope-architecture`
- `api-contract-evolution`
- `effect-sql-repository-architecture`
- `effect-layered-testing`
- `react-atom-architecture` if UI is added
- `effect-observability-patterns`

## Expected agent behavior

- Distinguish actor, account scope, membership/access, and authorization.
- Explain how account scope is resolved and validated.
- Ensure scoped resources are queried with explicit account scope.
- Use 401 for missing/invalid auth, 403 for forbidden operations, and 404 for not found within scope.
- Add cross-account isolation tests.
- Avoid trusting client-provided account ID without validation.
- Update docs or justify why not.
- Include validation status and atomic commit plan.

## Fail conditions

- Invoice fetched by global ID only.
- Payload accountId used directly without access validation.
- Error response leaks that an invoice exists in another account.
- No cross-scope tests or justification.
- Product-specific permission checks hidden inside generic auth middleware.

## Rubrics

Use:

- `../rubrics/product-module.rubric.md`
- `../rubrics/auth-scope.rubric.md`
