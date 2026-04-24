# Config Rules for Effect-based Services

## Core rule

Configuration belongs to the service or module that consumes it.

Examples:
- an external API client config belongs next to that client or scraper service
- HTTP server config belongs next to server bootstrap or the server layer
- observability config belongs next to observability setup

Do not create a single global application config unless multiple modules genuinely share the same config domain.

## Required vs optional

### Required config

Use required config when the service cannot function correctly without the value.

Examples:
- API tokens required for external integrations
- actor IDs or model IDs required for a specific integration
- telemetry endpoint when observability must be enabled
- server port when startup must be explicit

Patterns:

```ts
const token = yield* Config.nonEmptyString("API_TOKEN")
const port = yield* Config.port("PORT")
const limit = yield* Config.int("REQUEST_LIMIT")
const enabled = yield* Config.boolean("FEATURE_ENABLED")
```

Required config must fail layer or service initialization if missing or invalid.

### Optional config

Use optional config only when absence is a valid state and the code has an intentional behavior for it.

Pattern:

```ts
const token = yield* Config.option(Config.nonEmptyString("API_TOKEN"))
```

Do not use optional config just to make local development easier.

### Optional config with default

Use defaults only when the fallback is part of intended behavior, not just developer convenience.

Pattern:

```ts
const limit = yield* Config.int("REQUEST_LIMIT").pipe(
  Config.withDefault(12)
)
```

If the value is critical to correctness, do not use a default.

## Validation preferences

Prefer typed constructors:
- strings: `Config.nonEmptyString`
- integers: `Config.int`
- ports: `Config.port`
- booleans: `Config.boolean`

Avoid manual parsing such as:

```ts
Number(process.env.X ?? "12")
(process.env.FLAG ?? "true") !== "false"
process.env.VALUE ?? "default"
```

## Layer construction

If config is used to build a layer dynamically, use `Layer.unwrap(Effect.gen(...))`.

Example:

```ts
const HttpServerConfigLayer = Layer.unwrap(
  Effect.gen(function*() {
    const port = yield* Config.port("PORT")
    return NodeHttpServer.layer(createServer, { port })
  })
)
```

## Service-local config

Prefer service-local config services when configuration is reused within a domain.

Example:
- `ApiClientConfig` as a dedicated service consumed by `ApiClient`
- `ObservabilityConfig` as a dedicated service consumed by telemetry setup

## Strictness policy

Default policy:
- configuration is required unless there is a strong reason for it to be optional
- no hidden defaults for critical infrastructure or integrations
- missing required config should fail startup clearly and early

## Migration guidance

When migrating from `process.env` to Effect Config:

1. Identify all env var reads in the target module.
2. Classify each variable as required, optional, or optional with default.
3. Replace manual parsing with typed `Config` constructors.
4. Move config close to the consuming service or layer.
5. Remove fallback behavior that exists only because config was previously read in an ad hoc way, unless that fallback is intentional.
6. Run the project's typecheck and any relevant startup or integration checks.

## Good architecture signals

A config design is probably good if:
- a service's required env vars are obvious from its local config definition
- startup fails early for invalid required config
- optional behavior is explicit in code
- defaults are intentional and documented
- unrelated services do not depend on a shared monolithic config object
