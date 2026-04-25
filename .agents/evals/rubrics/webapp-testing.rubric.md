# Webapp Testing and Storybook Rubric

Use for scenarios involving frontend tests, Storybook, stories, or UI test strategy.

## Required checks

- [ ] Uses or clearly follows `webapp-testing-architecture` and relevant component/screen skills.
- [ ] UI layer under test is identified: ui, patterns, domain, screens, atoms, route flow.
- [ ] Feature components with important visual states have stories/tests or absence is justified.
- [ ] Stories use mock props/data and do not call real APIs.
- [ ] Story state matrix covers relevant states: default, populated, empty, loading, error, disabled, pending, validation error.
- [ ] Vitest/Testing Library tests assert user-visible behavior where relevant.
- [ ] Snapshot-only testing is not the primary strategy.
- [ ] Screen tests preserve explicit query state branching.
- [ ] Remote data/atoms are mocked at a clear boundary.
- [ ] Docs/commands are updated when tooling changes.
- [ ] Validation status is reported.

## Fail conditions

- Stories depend on dev/prod API.
- UI tests assert implementation details instead of behavior.
- Transient state moved to atoms for test convenience.
- Storybook/test tooling added with no docs/commands.
- Important feature states missing without justification.

## Scoring suggestion

- testing strategy/layer choice: 20
- story coverage/state matrix: 25
- behavior tests quality: 20
- atom/API mocking boundary: 15
- docs/validation: 20
