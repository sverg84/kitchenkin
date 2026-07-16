---
name: backend-impl-prisma-redis
description: Implements or modifies KK backend logic (@kk/domain + Prisma + Redis) based on an approved design. Use when implementing domain services, REST route handlers, optimizing Prisma queries, or adding Redis caching.
---

# Backend Implementation & Optimization (Domain + Prisma + Redis)

Implement or modify backend logic based on an existing or approved design using `@kk/domain`, Prisma, and Redis.

## KK backend touchpoints (use these)

- **Domain services**: `packages/domain/src/**` — server-only; `import "server-only"` in Prisma modules.
- **REST route handlers**: `apps/web/src/app/api/**` — resolve auth with `auth()` from `apps/web/auth.ts`, call domain with `userId`.
- **Server Actions**: `apps/web/src/lib/prisma/server-actions.ts` — thin wrappers over domain for web form writes.
- **API contract**: `docs/api.md` + Zod in `packages/shared/src/api/`.
- **Prisma**: `packages/db` — schema `packages/db/prisma/schema.prisma`, client via `@kk/db`.
- **Redis (auth)**: `packages/auth/src/auth-options-core.ts` — Better Auth `secondaryStorage` via `REDIS_URL`.

Prefer extending existing domain modules (`recipes/`) rather than new abstractions.

## Preconditions

- A design exists (from a plan or approved contract). If missing, request it or produce a minimal implementation plan first.
- Schema changes are **not** part of this task unless the user explicitly requests them.

## Implementation workflow (follow in order)

### 1) Re-state the behavioral contract

- **Operation(s)**: query/mutation names + inputs/outputs
- **AuthZ rules**: public vs authenticated, ownership checks
- **Correctness invariants**: uniqueness, ordering, idempotency, consistency expectations
- **Non-functional**: latency targets, acceptable staleness (if caching)

### 2) Locate the right module(s)

- Identify the target file(s) under `packages/domain/src/`.
- Match existing patterns (cursor pagination in `recipes/list-recipes.ts`, explicit `select` in `recipe-select.ts`).

### 3) Implement resolver logic (minimal and localized)

- Keep entrypoints thin; keep logic small and readable.
- Prefer Prisma query shapes that:
  - avoid N+1 (use `include` / `select` / relation fetching intentionally)
  - paginate correctly (cursor vs offset), consistent ordering
  - enforce invariants with DB constraints when already present
- Use transactions only when multi-write invariants require it.
- Preserve existing error behavior patterns (don’t redesign errors unless asked).

### 4) Prisma optimization checklist

- **Select only needed fields** (avoid overfetching).
- **Avoid N+1**: batch or fetch relations efficiently.
- **Indexes**: if performance depends on new indexes, note it as a follow-up unless user asked to change schema.
- **Consistency**: ensure `where` clauses reflect authZ and ownership rules.

### 5) Redis caching (implement only when it’s appropriate)

#### Decide what to cache

Cache only when it has a clear payoff and safe invalidation:

- read-heavy query results
- expensive aggregations
- per-user derived views (if stable)

#### Key design

Keys must be:

- namespaced
- versioned
- include all inputs that affect the result

Use a consistent shape:

- `kk:gql:v1:<operation>:<stable-hash-of-args>`
  - Include user scope where relevant: `...:user:<userId>:...`

#### TTL + staleness

- Default to short TTLs unless the design says otherwise.
- If strong consistency is required, avoid caching or cache only immutable data.

#### Invalidation strategy

Pick one (state explicitly):

- **Write-through**: update cache on writes
- **Write-around + invalidate**: delete affected keys on writes (preferred when simple)
- **Event-driven**: invalidate via background jobs/events (only if already present)

Call out:

- what write operations invalidate what reads
- how to handle fan-out invalidation (avoid complex patterns unless required)

#### Consistency handling

- Use “best effort” caching unless stricter guarantees are required.
- Prevent cache stampedes conceptually (single-flight) only if needed; otherwise keep simple.

### 6) Verification (minimal but real)

- **Happy path**: one end-to-end resolver invocation (manual or test)
- **AuthZ**: at least one unauthorized/forbidden case
- **Caching**: confirm hit/miss behavior and invalidation on writes
- **Performance sanity**: confirm query count/shape doesn’t regress obviously

## Output expectations (when doing the work)

- Small, reviewable diffs.
- No schema or architecture changes unless explicitly requested.
- If you must add a helper/service, keep it tiny and colocated with the feature.
- Document cache keys + invalidation decisions in the PR description or change summary.

## Scripts

Run these from repository root after implementing caching logic:

- `node .cursor/skills/backend-impl-prisma-redis/scripts/lint-redis-keys.mjs --report .review/redis-key-lint.md`
  - Enforces key namespace/version conventions and flags likely missing user scoping.
  - Default mode is warning-only for legacy keys.
  - Add `--strict` to enforce non-zero exit for new/cleaned codepaths.
- `node .cursor/skills/backend-impl-prisma-redis/scripts/redis-cache-report.mjs --out .review/redis-cache-report.md`
  - Generates cache call-site/key-shape documentation for review notes.
