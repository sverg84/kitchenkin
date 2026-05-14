---
name: code-review-maintainability
description: Reviews existing code for quality, structure, and maintainability. Use when the user asks for a code review, refactoring suggestions, readability improvements, complexity reduction, or maintainability feedback while preserving external behavior and matching existing project patterns.
---

# Code Review & Refactoring Suggestions

Review existing code for quality, structure, and maintainability.

Start by summarizing what the code currently does. Identify issues in readability, structure, duplication, coupling, and consistency with existing patterns. Distinguish between critical issues (bugs, incorrect logic) and non-critical improvements (refactoring, clarity, simplification). Propose minimal, incremental improvements that preserve behavior. Do not rewrite entire systems unless explicitly requested. Focus on improving maintainability and reducing complexity without changing external behavior.

## Inputs to gather (ask only if needed)

- **Scope**: file(s)/function(s) to review and desired depth (quick vs thorough)
- **Behavioral contract**: what must not change (public API, side effects, performance constraints)
- **Context**: surrounding modules/patterns in this repo that should be followed
- **Constraints**: deadlines, “no deps”, compatibility requirements

If missing, proceed with best-effort review and state assumptions.

## Output format (use this structure)

### Summary (what the code does)

- **Purpose**:
- **Key flows**:
- **Inputs/outputs & side effects**:
- **Main dependencies**:

### Findings

Separate into **Critical** vs **Non-critical**.

#### Critical (must fix)

Only include items that are likely bugs or correctness issues:

- incorrect logic or edge-case handling
- security vulnerabilities / auth gaps
- data races / consistency issues
- error handling that violates contract
- performance issues that can cause timeouts/outages

For each item include:

- **Issue**:
- **Evidence**: point to the specific code path
- **Impact**:
- **Minimal fix**:
- **Verification**:

#### Non-critical (should consider)

Maintainability improvements that preserve behavior:

- readability (naming, structure)
- duplication removal
- overly long functions / deep nesting
- confusing abstractions / unnecessary indirection
- inconsistency with existing repo patterns

For each item include:

- **Suggestion**:
- **Why**:
- **Smallest safe change**:
- **Risk** (what might accidentally change):

### Incremental refactor plan

Propose a short, ordered set of small PR-sized steps:

- Step should compile and keep behavior unchanged
- Prefer mechanical refactors first (rename, extract function, simplify branches)
- Defer bigger restructures unless explicitly requested

### Consistency with repo patterns

Call out any mismatches and the recommended alignment:

- folder/file placement conventions
- error handling style
- type/schema validation patterns
- data fetching/caching patterns (if relevant)

### Test / verification notes

- **Existing tests**: what covers the area (if known)
- **Minimum checks**: smallest validation steps to prove no behavior change

## Guardrails

- Don’t propose rewrites; keep suggestions incremental and local.
- Preserve external behavior unless the user asks to change it.
- Prefer clarity and maintainability over cleverness.

## Scripts

Use the shared review packet script to standardize review context:

- `bash scripts/review-packet.sh`
  - Produces `.review/packet.md` with change summary, lint, and typecheck output.
- `bash scripts/review-packet.sh --with-prisma`
  - Includes Prisma sanity checks for backend-heavy changes.

Treat failures as blockers for review sign-off unless explicitly waived.

## Skill linkages (handoffs)

### Optional handoff to `refactor-simplify-code`

Only invoke `refactor-simplify-code` **after** changes are approved (or the user explicitly asks you to perform the refactor).

Constraints:

- Apply only the **approved** subset of improvements.
- Keep behavior unchanged and diffs small.
- Avoid broad rewrites; treat this as a targeted follow-through step.
