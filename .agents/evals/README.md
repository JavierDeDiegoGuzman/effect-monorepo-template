# Agent Evals

These evals are meta-infrastructure for maintaining the agentic development system around this template.

## Primary objective

The primary objective of this repository is still the full-stack Effect SaaS template. Evals are not part of the product/runtime template. They live under `.agents/evals` so they do not obscure the developer-facing template docs under `docs/*`.

Use evals to answer:

- Do agents follow `AGENTS.md`?
- Do agents select and apply the right skills?
- Do the skills produce better architecture, tests, docs, observability, and reviewable diffs?
- Which skill instructions need to be tightened after failures?

## Eval types

### Scenario evals

Scenario evals describe representative tasks and expected behavior. They can be run manually or with an LLM-as-judge.

Each scenario should include:

- task prompt
- expected skills
- setup assumptions
- required outputs
- fail conditions
- suggested rubric

### Rubrics

Rubrics define how to judge an agent result for a category such as product module expansion, auth/scope, API contracts, observability, or webapp testing.

### Judge prompts

Judge prompts define how to ask an LLM to review:

- the original task
- relevant skills
- the agent's final response
- the git diff or patch
- the rubric

The judge should return structured JSON so results can be compared over time.

## Recommended workflow

1. Pick a scenario under `.agents/evals/scenarios`.
2. Run an agent on a clean branch or throwaway copy.
3. Save the final response and diff.
4. Run or manually apply the relevant rubric.
5. Classify failures:
   - missing skill instruction
   - ambiguous skill instruction
   - conflicting docs
   - agent ignored clear instruction
   - missing tooling
6. Update skills/docs/evals.
7. Re-run the scenario.

## What not to do

- Do not put product template docs here. Use `docs/*` for developer-facing template documentation.
- Do not make runtime code depend on eval files.
- Do not optimize the product architecture for passing evals only; evals should encode the desired architecture, not replace it.
- Do not accept vague judge output. Failures should lead to concrete skill/doc changes.

## Initial scenarios

- `scenarios/add-simple-module.md`
- `scenarios/add-scoped-module.md`
- `scenarios/api-contract-change.md`
- `scenarios/persistence-relationship.md`
- `scenarios/observability-flow.md`
- `scenarios/storybook-setup.md`

## Initial rubrics

- `rubrics/product-module.rubric.md`
- `rubrics/auth-scope.rubric.md`
- `rubrics/api-contract.rubric.md`
- `rubrics/observability.rubric.md`
- `rubrics/webapp-testing.rubric.md`

## LLM judge

Use `judges/llm-as-judge-prompt.md` as a starting prompt for manual or scripted evaluation.
