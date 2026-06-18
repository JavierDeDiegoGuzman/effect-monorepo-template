# Code Comment Style

Use T3 Chat-style comments: comments are rare, intentional, and explain context the code cannot make obvious.

## Default posture

Prefer self-documenting code over comments:

- rename values, functions, components, services, atoms, or tests so intent is visible
- extract a helper when a block needs a paragraph
- encode invariants in schemas, types, branded IDs, constraints, tests, or Effect errors
- use explicit domain vocabulary instead of adding a translation comment

Only add a comment after improving names/structure would still leave important context hidden.

## Keep comments when they explain why

Good comments preserve context that future maintainers cannot infer locally:

- product or domain invariants that are easy to accidentally break
- security, auth, tenancy, or privacy decisions
- persistence, transaction, migration, or SQL constraints that are not obvious from the query
- external API/protocol compatibility or browser/platform workarounds
- performance or concurrency tradeoffs with a concrete reason
- test fixture/setup rationale when the setup intentionally differs from production
- observability redaction choices, especially why an annotation is safe

Example:

```ts
// Keep this lookup scoped by accountId so a leaked todoId cannot cross tenants.
return repository.findByAccountAndId({ accountId, todoId })
```

## Remove comments that narrate what

Avoid comments that restate code, types, or framework mechanics:

```ts
// Create a todo
const todo = createTodo(input)

// Set loading to true
setIsLoading(true)

// User schema
export const User = Schema.Struct({ ... })
```

Prefer clearer code:

```ts
const createdTodo = createTodo(input)
```

## JSDoc and exported APIs

Do not add JSDoc just because a function, type, component, or service is exported. Use JSDoc only when it documents a stable public contract, non-obvious semantics, caller obligations, or compatibility constraints that are not expressed in types.

Bad:

```ts
/** Gets a user by id. */
const getUser = (id: UserId) => ...
```

Good:

```ts
/** Returns None instead of failing when the user exists in another account. */
const findVisibleUser = (input: FindVisibleUserInput) => ...
```

## TODO comments

Avoid vague TODOs. If a comment tracks deferred work, include the reason and a durable reference when available:

```ts
// TODO(#123): Remove this fallback after existing sessions expire.
```

Do not leave commented-out code. Delete it or create an issue/ADR if the decision matters.

## Layer-specific guidance

### Shared contracts and API

- Comment breaking compatibility, wire-format oddities, and client-visible semantics that schemas cannot express.
- Do not comment obvious field names or duplicate schema descriptions.

```ts
// Accept the legacy field during the migration window; responses only emit displayName.
legacyName: Schema.optional(Schema.String)
```

### Backend services and repositories

- Comment authorization boundaries, transaction ordering, lock/concurrency choices, and SQL portability constraints.
- Do not comment every repository method or `SqlSchema` operation when names are clear.

```ts
// Insert the membership before the audit event so rollback cannot leave an orphaned audit row.
yield* memberships.insert(input)
yield* auditEvents.insert(event)
```

### Configuration

- Comment surprising defaults, deployment compatibility, and intentional startup failures.
- Do not comment direct mappings from environment variables to config values.

```ts
// Default to localhost only for local template cloning; production must set PUBLIC_APP_URL.
publicAppUrl: Config.withDefault(Config.url("PUBLIC_APP_URL"), new URL("http://localhost:5173"))
```

### Tests and fixtures

- Comment why a fixture is shaped unusually or why a test uses a specific layer.
- Do not narrate arrange/act/assert blocks unless the setup is intentionally counterintuitive.

```ts
// Seed two accounts to prove repository filtering, not just service-level ownership checks.
yield* seedAccount(otherAccount)
```

### Observability

- Comment redaction and cardinality decisions when a future edit might expose sensitive data.
- Do not comment routine span names or annotations.

```ts
// Record title length, not the title, because todo titles may contain customer data.
yield* Effect.annotateCurrentSpan("todo.title_length", input.title.length)
```

### React atoms, components, and screens

- Comment unusual composition/state ownership choices, accessibility workarounds, or browser quirks.
- Do not explain JSX structure, prop passthrough, or obvious loading/error branches.

```tsx
// Keep focus on the trigger because the command menu remounts after route transitions.
triggerRef.current?.focus()
```

## Review pass checklist

When touching code, do a quick comment pass:

1. Delete comments that restate code.
2. Improve names or extract helpers where a comment explains structure instead of rationale.
3. Keep or add comments for hidden constraints, tradeoffs, and safety boundaries.
4. Check that kept comments are still true after the edit.
5. Move long examples or rationale to docs/ADRs when the comment becomes design documentation.
