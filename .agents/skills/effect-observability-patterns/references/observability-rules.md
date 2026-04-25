# Observability Rules

## Development workflow first

Local observability should answer:

- how do I start the tracing stack?
- which URLs should I open?
- which services should appear?
- which operation names should I search for?
- what trace shape should I expect for a common workflow?
- what should I check when traces do not appear?

If developers cannot answer these from docs, update the docs.

## Instrument by layer

### Client atoms/actions

Remote reads and writes should include spans close to the Effect performing the work.

```ts
ApiClient.use((client) => client.projects.list()).pipe(
  Effect.withSpan("projects.list", { kind: "client" }),
)
```

### HTTP handlers

Handlers should annotate transport information using route patterns, not raw URLs with sensitive data.

```ts
Effect.annotateSpans({
  "http.route": "/projects/:id",
  "http.method": "GET",
})
```

### Domain services

Domain service operations should be named around business behavior.

```ts
const create = Effect.fn("Projects.create")(function* (...) {
  // business behavior
})
```

Add explicit spans when the runtime does not produce useful names from `Effect.fn` or when a workflow needs clearer tracing.

### Repositories

Repository spans are useful for operations that may be slow, complex, or important to debug.

Use repository operation names, not raw SQL strings.

```txt
SqlProjectsRepository.create
SqlProjectsRepository.getById
```

## Expected trace shape

A remote write should usually be understandable as:

```txt
<module>.create
  http.client POST /<module>
    http.server POST /<module>
      <Module>.create
        Sql<Module>Repository.create
```

Client and server traces may be separate if trace context propagation is not configured. If so, document that limitation.

## Safe annotations

Prefer:

- counts
- lengths
- enum values when non-sensitive
- internal IDs when acceptable
- booleans
- route patterns

Avoid:

- tokens
- passwords
- emails
- raw names/titles/descriptions
- raw payloads
- secrets
- full URLs with sensitive query strings

## Errors

Expected domain errors should be visible enough to debug behavior.

Unexpected defects should not be swallowed. Let Effect/reporting infrastructure surface them, and add context where safe.

Do not add sensitive data to errors just to make traces easier to read.

## Docs checklist

`docs/observability.md` should include:

- local start/stop commands
- UI URLs
- required/optional env vars
- expected service names
- important operation names
- at least one expected trace shape
- troubleshooting for missing server spans
- troubleshooting for missing browser spans
