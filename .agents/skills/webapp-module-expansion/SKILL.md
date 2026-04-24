---
name: webapp-module-expansion
description: Introduce a new product module end-to-end across shared contracts, backend implementation, atoms, feature UI, screens, and navigation while preserving the template architecture.
---

# Webapp Module Expansion

Use this skill when introducing a new user-facing module or domain to the template.

Read [references/module-expansion.md](references/module-expansion.md) before making changes.

## Goals

- Add new modules without breaking architectural boundaries
- Keep contracts, backend, atoms, UI, and navigation aligned
- Give each new module clear ownership across layers
- Reuse the existing screen and component architecture
- Introduce modules as product capabilities, not just isolated screens

## Typical module scope

A module often touches:
- shared contracts or schemas
- backend handlers/services
- frontend atoms
- feature components
- one or more screens
- navigation

## Process

1. Define the module boundary and naming first.
2. Design the shared contract before UI details.
3. Add backend support owned by the module domain.
4. Add frontend atoms for reads and mutations.
5. Build feature components in the module folder.
6. Add or update screens that expose the module.
7. Update navigation only if the module is user-facing.
8. Reuse component and screen architecture skills while implementing.
9. Run relevant checks across affected packages.

## Output expectations

When you expand the app with a new module:
- mention the new module boundary and naming
- mention which contracts were added or changed
- mention which atoms own the module state
- mention which screens or routes were added
- mention any navigation changes
