# Module Expansion Rules

## Core rule

A module is a product/domain capability that should be introduced coherently across the stack, not as a disconnected UI patch.

## What counts as a module

A module usually has:
- its own domain concepts
- a shared contract or typed boundary
- backend behavior
- frontend reads and writes
- dedicated feature UI
- at least one clear screen or route surface

Not every small UI tweak is a module.

## Naming and boundaries

Start by naming the domain clearly.

Prefer boundaries like:
- todos
- projects
- billing
- profile
- notifications

Avoid vague buckets like:
- misc
- data
- tools
- admin-stuff

## Expansion order

### 1. Shared contract

Define the typed contract first.

Questions:
- what entities exist?
- what reads exist?
- what commands/mutations exist?
- what inputs and outputs are shared across server and webapp?

### 2. Backend implementation

Add handlers, services, and any persistence logic under the new domain boundary.

Keep configuration, validation, and service ownership local to the module where possible.

### 3. Frontend state

Add reads and writes in atoms for the module.

Be explicit about:
- reactivity keys
- query ownership
- mutation invalidation
- local vs shared state

### 4. Feature UI

Create feature-specific forms, lists, summaries, and item components under the module's folder.

Reuse `ui/*` and `patterns/*` rather than hand-building layout in screens.

### 5. Screens

Expose the module through dedicated screens.

Common shapes:
- collection screen for all entities in the module
- detail screen for one entity in the module

### 6. Navigation

If the module is user-facing, add it to app navigation in a way that matches the product structure.

## Ownership by layer

- contracts belong to shared/api boundaries
- backend belongs to the module domain on the server
- atoms belong to frontend state for that module
- feature components belong in the module folder
- screens belong in `components/screens/*`
- global layout belongs in shell and pattern layers

## Integration questions

Before shipping a new module, ask:
- is the domain boundary clearly named?
- does the module have a typed contract?
- do reads and writes have proper atom ownership?
- does the UI follow the same component and screen rules as the rest of the app?
- does navigation make the module discoverable without clutter?
- is the module visible as a coherent capability instead of scattered changes?

## Anti-patterns

- building the UI first with no contract
- scattering one module across unrelated folders without ownership
- adding module-specific layout hacks to the shell
- skipping atoms and wiring remote calls ad hoc in many components
- placing all module UI directly in a screen file
- adding navigation before the module has a coherent screen model

## Checklist

Before finishing:
- Have I named the module clearly?
- Is the shared contract defined?
- Is backend ownership clear?
- Are atoms introduced with clear reactivity/invalidation?
- Are feature components grouped by module?
- Are the right screens added?
- Was navigation updated only if needed?
