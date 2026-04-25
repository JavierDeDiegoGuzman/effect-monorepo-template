---
name: webapp-testing-architecture
description: Design and implement frontend tests and Storybook coverage for React webapps using component architecture, @effect/atom-react boundaries, Vitest, Testing Library, and Storybook interaction tests. Use when adding UI tests, Storybook, stories, visual states, or frontend test strategy.
---

# Webapp Testing Architecture

Use this skill when adding frontend tests, Storybook stories, component interaction tests, or frontend testing infrastructure.

Read [references/webapp-testing-rules.md](references/webapp-testing-rules.md) before making changes.

## Goals

- Make visual states explicit and reviewable through Storybook.
- Test behavior with Vitest and Testing Library where it matters.
- Keep remote data wiring testable by separating screen containers from feature UI when useful.
- Avoid shallow snapshot-only testing.
- Preserve the webapp layer model: `ui`, `patterns`, `domain`, `screens`, `atoms`.

## Testing roles

- Vitest unit/component tests: behavior, forms, utilities, render states.
- Testing Library: user-visible behavior and accessibility-oriented queries.
- Storybook: visual state catalog and component documentation.
- Storybook play/interaction tests: lightweight interaction checks for stories.
- E2E/smoke tests: full flows through a running app/API when needed.

## Process

1. Identify the UI layer under test: primitive, pattern, feature component, screen, atom integration, or route flow.
2. Keep presentational feature components renderable with props where practical.
3. Add stories for important visual states: default, empty, loading, error, disabled, pending, populated.
4. Add Vitest/Testing Library tests for behavior that can regress.
5. Add Storybook play tests for important component interactions when Storybook is configured.
6. Mock remote data at the boundary: props for feature UI, atom/runtime/test provider for screens, API mock only when testing integration.
7. Update docs when test/storybook commands or strategy changes.
8. Run relevant frontend checks/tests/builds and Biome linting when files were changed.

## Hard rules

- Do not rely on snapshots as the primary assertion for behavior.
- Do not make stories call real production/development APIs.
- Do not move transient form state into atoms just to test it.
- Do not hide query state branching in generic renderers just to simplify tests.
- Do not bury all feature UI inside screens; extract storybookable feature components where useful.
- Feature UI with remote data or mutations should cover important visual states in stories/tests, or explicitly justify why not.
- Stories must not call real production/development APIs.

## Documentation expectations

Update docs when adding Storybook, changing test commands, changing the frontend testing strategy, or introducing new test utilities.

Typical docs:

- `docs/testing.md`
- `docs/storybook.md`
- `docs/webapp-architecture.md`
- `docs/development.md`

## Output expectations

When applying this skill, report:

- UI layer tested
- stories added and visual states covered
- Vitest/Testing Library tests added
- Storybook interaction tests added if any
- how remote data/atoms were mocked or avoided
- docs updated
- validation commands run
