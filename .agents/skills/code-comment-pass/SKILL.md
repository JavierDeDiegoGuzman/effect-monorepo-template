---
name: code-comment-pass
description: Review and improve code comments using T3 Chat-style guidance: keep comments rare, useful, and focused on why rather than what. Use when adding comments, cleaning stale comments, reviewing a diff for comment quality, or doing a final polish pass before committing.
---

# Code Comment Pass

Use this skill when adding, editing, or reviewing comments in product/runtime code, tests, docs examples, and agent-authored snippets.

Read [T3 Chat-style comment guidance](../_shared/comment-style.md) before changing comments.

## Process

1. Scan changed files for new, stale, or nearby comments.
2. Delete comments that merely narrate code, duplicate types, or explain framework mechanics.
3. Improve names, extraction, schemas, tests, or types before adding explanatory comments.
4. Keep or add comments only for hidden context: invariants, auth/scope boundaries, security/privacy, SQL/transaction constraints, external compatibility, performance tradeoffs, unusual test setup, or observability redaction.
5. Replace vague TODOs with issue-backed TODOs or remove them.
6. Delete commented-out code.
7. Re-read kept comments after edits and verify they are still accurate.

## Output expectations

When applying this skill, report:

- comments removed as noise or stale context
- comments kept or added and the hidden rationale they preserve
- any code renamed/extracted instead of commenting
- validation command run
