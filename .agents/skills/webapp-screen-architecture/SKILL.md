---
name: webapp-screen-architecture
description: Design and refactor webapp screens, app shell behavior, and page structure using consistent screen recipes such as dashboard, collection, and detail pages.
---

# Webapp Screen Architecture

Use this skill when working on route screens, page headers, dashboard structure, app shell layout, or deciding how to split UI responsibilities across pages.

Read [references/screen-architecture.md](references/screen-architecture.md) before making changes. Read [code comment style](../_shared/comment-style.md) when adding or reviewing comments.

## Goals

- Keep screens focused on one primary responsibility
- Preserve consistent shell geometry and spacing across routes
- Use clear screen recipes instead of ad hoc page structures
- Keep screens thin by composing patterns and feature components
- Make dashboard, collection, and detail screens easy to recognize

## Supported screen types

- dashboard screens
- collection screens
- detail screens

## Process

1. Identify the screen type before implementing the UI.
2. Preserve app-shell ownership of global spacing, width, and navigation alignment.
3. Give each screen one primary job.
4. Use reusable page header and section patterns instead of duplicating layout markup.
5. Keep forms, lists, and detail blocks in feature components when possible.
6. For detail screens, consider related-resource sections implied by classified domain relationships.
7. If the screen has more than one major job, consider splitting it across routes.
8. Comment only hidden routing, accessibility, or relationship-driven UX rationale; do not narrate visible layout structure.
9. Run the webapp checks after the refactor.

## Documentation expectations

When applying this skill, update relevant docs if app shell geometry, screen recipes, routing structure, or page composition rules change.

Typical docs:

- `docs/webapp-architecture.md`
- `docs/architecture.md`

Docs describe this template's concrete screen setup. This skill describes the reusable screen architecture pattern.

## Output expectations

When you change screen architecture:
- mention the screen type affected
- mention any shell/layout changes
- mention any extracted screen patterns or sections
- mention related-resource sections added or explicitly declined for detail screens
- mention if responsibilities were split across screens
