# Component Architecture Rules

## Core rule

Use shadcn/ui as the primitive layer and build upward from there.

Do not invent a custom primitive if a shadcn component already exists for the need.

## Architectural layers

### 1. `components/ui/*`

This layer owns:
- shadcn-generated components
- thin wrappers around shadcn primitives
- primitive visual building blocks

This layer does not own:
- feature-specific copy
- domain state
- remote data wiring
- route layout

Questions to ask:
- is this a general-purpose visual primitive?
- would multiple features use it without knowing business context?
- does shadcn already provide it?

## 2. `components/patterns/*`

This layer owns:
- reusable screen and layout patterns
- page headers
- section layouts
- action bars
- empty states
- shell pieces

Build pattern components from `ui/*` primitives.

Questions to ask:
- is this structure repeated across multiple screens?
- is the value in the layout recipe rather than domain behavior?

## 3. `components/domain/<feature>/*`

This layer owns:
- feature-specific UI
- domain-oriented forms and lists
- feature-specific presentational pieces

It may know domain types and domain copy.

It should not define app-wide layout or global screen geometry.

## 4. `components/screens/*`

This layer owns:
- route-level composition
- choosing which patterns and feature components to assemble
- minimal local orchestration for the screen

Screens should be thin. If a screen becomes large because of repeated markup or styling, extract into `patterns/*` or a feature folder.

## shadcn usage policy

Prefer this order:

1. import an existing shadcn component from `components/ui/*`
2. add the missing shadcn component to the project if one exists upstream
3. create a project-specific pattern built from shadcn components
4. only create a truly custom primitive if shadcn does not fit the use case

## Composition rules

Prefer:
- explicit components
- children-based structure
- compound components when the pieces form one conceptual API
- named pattern components for repeated structures

Avoid:
- many boolean props that radically change rendering
- giant screens with many inline layout decisions
- render-prop APIs when children composition is enough
- mixing domain wiring into primitive components

## Boundary rules

### UI components

Good responsibilities:
- visual presentation
- accessibility primitives
- stable styling surface

Bad responsibilities:
- fetching remote data
- knowing atom details
- business-specific branching

### Feature components

Good responsibilities:
- domain-oriented forms
- feature-specific lists/items
- copy and labels for that feature

Bad responsibilities:
- acting as global layout infrastructure
- replacing shared patterns with one-off layout code

### Screens

Good responsibilities:
- one route, one primary purpose
- compose patterns and feature components
- keep local transient state close to the route when needed

Bad responsibilities:
- hand-rolling repeated spacing and section recipes
- hosting lots of primitive-level styling directly

## Anti-patterns

- many `div`s and utility classes repeated across screens
- building ad hoc primitives when shadcn already has them
- placing feature logic in `ui/*`
- large boolean-driven component APIs
- route screens that mix layout, primitives, and feature logic in one file

## Checklist

Before finishing:
- Did I choose the right architectural layer?
- Did I use shadcn first?
- Did I avoid custom primitives where shadcn exists?
- Did I extract repeated structure into a pattern?
- Did I keep screens thin?
- Did I keep logic out of `ui/*`?

## Markup and layout ownership

Structural intrinsic JSX (`div`, `section`, `main`, `article`, `header`, `footer`, `aside`, `nav`, `ul`, `ol`, `li`) is owned by `components/ui/*`, `components/patterns/*`, and local `components/domain/<feature>/*` pieces.

Screens and routes should compose named pattern/domain components rather than hand-writing structural JSX. If repeated page structure appears in a screen, extract it to `components/patterns/*`. If the structure is feature-specific, extract it to `components/domain/<feature>/*`.

`components/domain/*` may use local markup for feature cards, lists, and forms, but must not own app-wide geometry or full-page layout.

Run `pnpm verify:architecture` after webapp architecture changes.
