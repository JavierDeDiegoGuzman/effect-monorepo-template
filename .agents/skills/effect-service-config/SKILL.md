---
name: effect-service-config
description: Apply Effect configuration conventions for backend services and layers. Use when adding or refactoring environment variables, service-local config, startup config, or replacing process.env access with Effect Config in Effect-based repositories.
---

# Effect Service Config

Use this skill when working on configuration in Effect-based backend services.

Read [references/config-rules.md](references/config-rules.md) before making changes. Read [code comment style](../_shared/comment-style.md) when adding or reviewing comments.

## Goals

- Keep configuration local to the service or module that uses it
- Use `effect/Config` instead of direct `process.env` access
- Fail service or layer initialization when required config is missing or invalid
- Use defaults only for values that are truly optional
- Prefer typed config constructors over manual parsing

## Process

1. Identify the service, module, or layer that owns the configuration.
2. Keep config next to that service or module. Avoid creating a global mega-config unless multiple modules genuinely share the same config domain.
3. Replace direct `process.env` access with `Config`.
4. Apply strictness rules:
   - required: no default
   - optional: `Config.option(...)`
   - optional with fallback: `Config.withDefault(...)`
5. Prefer:
   - `Config.nonEmptyString(...)`
   - `Config.int(...)`
   - `Config.port(...)`
   - `Config.boolean(...)`
6. Remove manual parsing like:
   - `Number(process.env.X ?? "...")`
   - `(process.env.FLAG ?? "true") !== "false"`
7. If config is needed to construct a layer dynamically, use `Layer.unwrap(Effect.gen(...))`.
8. If a service currently has fallback or mock behavior because config is absent, preserve it only if explicitly requested. Otherwise make initialization fail.
9. Comment only surprising defaults, deployment compatibility constraints, or intentional startup failures; do not narrate direct env-to-config mappings.
10. After edits, run the project typecheck or equivalent verification command.

## Documentation expectations

When applying this skill, update relevant docs if environment variables, startup requirements, defaults, local development commands, or deployment/runtime behavior changes.

Typical docs:

- `docs/development.md`
- `docs/architecture.md`
- `docs/observability.md` when telemetry config changes

Docs describe this template's concrete config. This skill describes the reusable config pattern.

## Output expectations

When you change config-related code:
- mention which environment variables are now required
- mention which environment variables remain optional
- mention any removed fallback behavior
- mention any startup failures that are now intentional due to missing required config
