# Screen Architecture Rules

## Core rule

A screen should have one primary purpose and should compose reusable patterns and feature components instead of hand-building page structure every time.

## App shell responsibilities

The app shell owns:
- top-level navigation
- global page width
- global horizontal padding
- route-to-route visual stability
- persistent page chrome

Screens should not fight the shell by inventing different outer spacing or container geometry.

## Screen responsibilities

A screen owns:
- route-specific composition
- choosing which feature sections to show
- local route context and transient orchestration

A screen should not own:
- app-wide geometry
- primitive styling repeated across routes
- unrelated responsibilities bundled into one page

## Official screen recipes

### 1. Dashboard screen

Use for:
- orientation
- summary metrics
- previews of other areas
- primary navigation entry points

A dashboard should summarize and direct. It should not become the main CRUD surface for every domain.

### 2. Collection screen

Use for:
- managing a collection of entities
- showing create/edit entry points
- listing the full collection
- filtering or sorting if needed

A collection screen should answer: “how do I work with the set of things?”

Examples of common sections:
- page header
- create form or actions
- collection list
- empty state when the list is empty

### 3. Detail screen

Use for:
- one entity and its related information
- summary or metadata for the entity
- related collections within that entity's scope
- actions specific to that entity

A detail screen should answer: “how do I work inside this one thing?”

## One thing per page

Each screen should have one primary responsibility.

Good examples:
- dashboard = orient and summarize
- collection screen = manage a collection
- detail screen = work within one entity

Bad examples:
- one screen trying to be dashboard, collection, and detail at the same time
- unrelated admin tasks bundled into the same page because they are visually convenient

## Section structure

Inside a screen, favor a clear hierarchy:
- header
- sections
- actions
- content blocks

If the same section structure appears across multiple screens, extract a pattern component.

## Navigation and visual stability

Route changes should not cause avoidable visual jumps in:
- shell width
- nav alignment
- major page padding

If a route changes visual geometry, it should be for a strong product reason, not because the screen implemented layout differently.

## Anti-patterns

- screens with multiple primary jobs
- repeated ad hoc spacing/layout markup per route
- dashboard screens doing all CRUD directly
- collection/detail views embedded in ways that should be dedicated routes
- route-specific hacks that make the header or nav shift visually

## Checklist

Before finishing:
- What screen type is this?
- Does it have one primary purpose?
- Is shell geometry preserved?
- Is repeated layout extracted into patterns?
- Are feature-specific blocks kept out of the shell?
- Should this actually be split into another route?
