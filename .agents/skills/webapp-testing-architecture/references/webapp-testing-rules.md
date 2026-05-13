# Webapp Testing Rules

## Layer-specific guidance

### `components/ui/*`

Usually covered by:

- Storybook stories for variants
- accessibility smoke checks when custom behavior exists
- minimal tests only for non-trivial wrappers

Do not duplicate shadcn/Radix test suites.

### `components/patterns/*`

Cover:

- layout states
- optional slots/actions
- responsive/empty/error variants when relevant
- composition behavior

Use stories heavily.

### `modules/<module>/components/*`

Cover:

- forms
- lists
- item actions
- empty/error/pending states
- callback behavior
- accessibility labels and user-visible state

Prefer props and callbacks so components can be rendered without atoms or API calls.

### `components/screens/*`

Cover:

- query state branching
- route-level composition
- action feedback
- navigation behavior when relevant

Screens may need atom/test runtime setup. Keep screen tests fewer and more integration-oriented.

### `atoms/*`

Cover only when atom behavior is non-trivial:

- reactivity keys
- auth/session interaction
- error mapping
- input transformation

Most atom confidence can come from API/backend tests plus screen integration tests.

## Storybook state matrix

For important components, add stories for relevant states:

- default
- populated
- empty
- loading
- error
- disabled
- pending/submitting
- validation error
- permission denied/read-only

Stories should use mock data and callbacks, not real API calls.

## Vitest and Testing Library

Prefer user-visible assertions:

```ts
expect(screen.getByRole("button", { name: /create/i })).toBeEnabled()
```

Prefer interaction tests for behavior:

```ts
await user.type(screen.getByLabelText(/name/i), "Acme")
await user.click(screen.getByRole("button", { name: /create/i }))
expect(onCreate).toHaveBeenCalledWith(...)
```

Avoid testing implementation details such as internal state variable names or CSS class lists unless the class is the intended public styling contract.

## Screen and Storybook-friendly architecture

A good pattern is:

```txt
Screen container
  - reads atoms
  - renders AsyncResult states explicitly
  - wires actions
  - composes feature components

Feature view/component
  - receives data/callbacks as props
  - owns local transient form state if appropriate
  - renders UI states
  - has stories/tests
```

Do not force every component into this pattern, but prefer it when a screen is growing or when Storybook coverage is valuable.

## What to mock

Prefer smallest useful boundary:

- feature component: mock props/callbacks
- pattern component: mock children/slots
- screen: provide atom/test runtime or mocked atom values
- API integration: use API mocks/test server only when testing API wiring
- E2E: use running app/server with isolated test data

## Anti-patterns

- stories that depend on a local dev API
- tests that assert snapshots but not behavior
- moving state to global atoms for test convenience
- custom test helpers that hide important UI states
- mocking everything so the test no longer resembles user behavior
- not documenting new commands/setup

## State provisioning policy

Prefer props-first component tests. Domain components should receive data, pending flags, errors, and callbacks directly so tests/stories do not need atoms, router, or API mocks.

For screens, prefer testing an extracted `ScreenView` with explicit loading/error/empty/populated/pending states. Test the connected screen only when atom/router integration is the behavior under review.

Avoid adding a generic atom test harness such as `renderWithAtoms` until an integration test truly needs it. Provider-based composition components should expose injectable state/action/meta interfaces so stories and tests can provide deterministic state while production providers can derive state from atoms, router, or sync hooks.

ScreenView stories should use fixtures and cover the visual state matrix relevant to the screen.
