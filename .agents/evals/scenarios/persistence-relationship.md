# Scenario: Persistence Relationship

## Task prompt

```txt
Allow tasks to optionally reference projects. A task can exist without a project, but if a projectId is provided it must reference an existing project in the same product scope.
```

## Expected skills

- `product-module-expansion`
- `effect-sql-repository-architecture`
- `effect-layered-testing`
- `saas-auth-scope-architecture` if the resources are scoped
- `api-contract-evolution`

## Expected agent behavior

- Classify Task -> Project as a reference, not ownership.
- Decide persistence representation, likely nullable FK plus scope-safe validation.
- Validate referenced project existence in the domain service when projectId is provided.
- Keep SQL row types local.
- Do not add repository-to-repository calls.
- Add domain tests for reference validation.
- Add SQL repository tests for nullable reference and mapping.
- Add cross-scope tests if scoped.
- Update docs or justify why not.

## Fail conditions

- Treats optional reference as ownership without explanation.
- SQL join becomes the only access/validation rule.
- Domain service uses SQL client.
- Handler validates project relationship directly.
- No tests for invalid/missing project reference.

## Rubrics

Use:

- `../rubrics/product-module.rubric.md`
- `../rubrics/auth-scope.rubric.md` if scoped
