# LLM-as-Judge Prompt

Use this prompt to evaluate an agent result against a scenario and rubric.

## Judge role

You are evaluating whether a coding agent followed this repository's agentic architecture system. Be strict. Prefer concrete failures over vague praise.

The repository's primary objective is to remain a high-quality full-stack Effect SaaS template. The `.agents/*` content is meta-infrastructure for maintaining that template.

## Inputs to provide

Paste these sections into the judge request:

```txt
<SCENARIO>
... scenario markdown ...
</SCENARIO>

<RUBRIC>
... rubric markdown ...
</RUBRIC>

<RELEVANT_SKILLS>
... selected skill excerpts or full skill files ...
</RELEVANT_SKILLS>

<AGENT_FINAL_RESPONSE>
... final response ...
</AGENT_FINAL_RESPONSE>

<GIT_DIFF>
... git diff ...
</GIT_DIFF>
```

## Judge instructions

Return JSON only, with this shape:

```json
{
  "score": 0,
  "verdict": "pass | pass_with_warnings | fail",
  "summary": "short explanation",
  "skill_selection": {
    "score": 0,
    "expected": [],
    "used_or_implied": [],
    "missing": []
  },
  "checks": [
    {
      "id": "string",
      "status": "pass | warn | fail | not_applicable",
      "evidence": "quote filenames, diff snippets, or final response evidence",
      "comment": "why this matters"
    }
  ],
  "hard_rule_violations": [
    {
      "rule": "string",
      "evidence": "string",
      "recommended_fix": "string"
    }
  ],
  "missing_outputs": [],
  "docs_assessment": "string",
  "testing_assessment": "string",
  "observability_assessment": "string",
  "atomic_commit_assessment": "string",
  "recommended_skill_updates": [
    {
      "skill": "string",
      "change": "string",
      "reason": "string"
    }
  ],
  "recommended_doc_updates": [
    {
      "doc": "string",
      "change": "string",
      "reason": "string"
    }
  ]
}
```

## Scoring guidance

- `pass`: score >= 85 and no hard rule violations.
- `pass_with_warnings`: score 70-84 or minor gaps with no severe architecture violation.
- `fail`: score < 70 or any severe hard rule violation.

Severe hard rule violations include:

- handler calls SQL/repository directly for domain behavior
- domain service depends on SQL client
- scoped resource fetched by global ID only without scope validation
- shared contract changed without reviewing consumers
- non-trivial architecture change with no docs update or justification
- non-trivial change with no validation status
- full module implemented without Phase 0/1 planning
- broad mixed diff with no atomic commit plan

## Evaluation principles

- Judge the diff and final response, not intentions.
- If something is claimed but not present in the diff/response, mark it as missing.
- If a check is not relevant to the scenario, mark `not_applicable`.
- Prefer actionable recommendations.
- If the agent failed because a skill was ambiguous or missing a rule, recommend a skill update.
