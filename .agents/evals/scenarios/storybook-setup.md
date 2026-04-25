# Scenario: Storybook and Frontend Testing

## Task prompt

```txt
Add Storybook to the webapp and create stories plus basic interaction tests for the project list and project creation form components.
```

## Expected skills

- `webapp-testing-architecture`
- `webapp-component-architecture`
- `webapp-screen-architecture` if screens are touched
- `vercel-composition-patterns`

## Expected agent behavior

- Keep Storybook as component/visual-state infrastructure, not product runtime.
- Add docs/commands for Storybook and tests.
- Ensure stories do not call real APIs.
- Prefer feature components rendered with mock props/callbacks.
- Cover important visual states: populated, empty, pending/submitting, validation error, disabled if applicable.
- Add interaction tests for meaningful form/list behavior.
- Do not move transient form state into atoms for test convenience.
- Include validation status and atomic commit plan.

## Fail conditions

- Stories call the dev/prod API.
- Only snapshot tests are added.
- Storybook setup has no docs or commands.
- Feature UI remains buried entirely in screens, making stories awkward.
- Tests assert implementation details rather than user-visible behavior.

## Rubric

Use `../rubrics/webapp-testing.rubric.md`.
