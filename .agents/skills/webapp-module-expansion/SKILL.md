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
- Make relationships to existing modules explicit instead of letting them emerge accidentally
- Prefer the smallest necessary change to existing domains unless a broader relationship is a stable domain invariant

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
2. Assess relationships to existing domains before changing them:
   - identify which existing domains the new module touches
   - classify each relationship as ownership, containment, reference, access policy, or orchestration
   - prefer the smallest necessary change to existing domains by default
   - if several modules may share the same context, consider introducing that shared context explicitly instead of coupling each module directly to the new one
3. Design the shared contract before UI details.
4. Add backend support owned by the module domain.
5. Add frontend atoms for reads and mutations.
6. Build feature components in the module folder.
7. Add or update screens that expose the module.
8. Update navigation only if the module is user-facing.
9. Reuse component and screen architecture skills while implementing.
10. If multiple reasonable data models exist and the choice materially affects future module design, surface the tradeoff clearly and ask for confirmation before implementing.
11. Run relevant checks across affected packages.

## Domain relationship guidance

- Do not assume a new module should directly add foreign keys or references to existing entities.
- First decide whether the relationship is intrinsic domain structure, shared context/scope, access policy, or coordination logic.
- Prefer embedding a new relationship into an existing entity only when it is a stable invariant of that entity.
- Avoid letting auth, UI, or transport concerns dictate long-term resource modeling.
- If a more stable intermediate boundary such as workspace, account, tenant, scope, membership, or ownership better represents the relationship, prefer that over coupling each existing module directly to the new one.

## Output expectations

When you expand the app with a new module:
- mention the new module boundary and naming
- mention which existing modules or domains were affected and how they relate to the new module
- mention which contracts were added or changed
- mention which atoms own the module state
- mention which screens or routes were added or reshaped
- mention any navigation changes
- mention any architectural decision that required confirmation because it affects future module design
