---
name: backend-graphql-feature-design
description: Designs backend features using a GraphQL-first approach for KitchenKin (KK). Use when adding/changing GraphQL types/queries/mutations, designing API contracts, mapping GraphQL to Prisma models, outlining resolver/service/DB data flow, or considering Redis caching conceptually (without implementing it unless asked).
---

# Backend Feature Design (GraphQL-first)

Design backend features using a GraphQL-first approach.

Start by defining the GraphQL schema changes, including types, inputs, queries, and mutations. Define the intended API contract clearly. Outline required data models and translate them into Prisma schema changes if needed. Define high-level data flow between API layer, services, and database. Identify where caching (Redis) may be useful conceptually, but do not implement it unless explicitly required. Ensure the design aligns with existing KK backend architecture and avoids introducing unnecessary new abstractions.

## KK architecture touchpoints (use these patterns)

- **GraphQL HTTP server**: `apps/api` (Bun + Hono + Apollo Server) — mount path `/graphql`; mobile auth under `/auth/mobile/*`.
- **Schema construction (Pothos)**: `packages/api/src/schema/`
  - Base builder: `packages/api/src/schema/builder.ts`
  - Feature modules: `packages/api/src/schema/*.ts` (e.g. `recipe.ts`, `user.ts`)
  - Import registry: `packages/api/src/schema/index.ts` (side-effect imports + exports `builder`)
  - Package entry: `packages/api/src/index.ts` (`schema`, `GraphQLContext`, etc.)
- **Prisma schema**: `packages/db/prisma/schema.prisma`
- **Redis (web vs API)**: `apps/web/src/lib/redis.ts` and `apps/api/src/redis.ts` (use only for conceptual caching notes unless asked)

**Avoid new abstractions**: prefer extending the existing Pothos modules under `packages/api/src/schema/` and using Prisma directly in resolvers unless KK already has a service layer for that domain.

## Inputs to gather (ask only if needed)

- **Feature request**: user story + success criteria
- **AuthZ**: who can call it (public vs authenticated) and any ownership rules
- **Data model**: new entities/fields, relationships, constraints, expected volume
- **Read/write patterns**: common queries, filtering, pagination, ordering
- **Non-functional**: correctness constraints, latency targets, caching needs, audit/logging

If missing, proceed with explicit assumptions and keep the design minimal.

## Output format (use this structure)

### Restated goal (GraphQL contract)

- **What capability we’re adding**:
- **Who uses it**:
- **Primary operations**: query/mutation names
- **Success criteria**:
- **Non-goals**:

### GraphQL schema changes (first)

Define the **API contract** explicitly.

- **New/updated types**:
  - Fields and nullability rules
  - Relationships (connections vs lists)
- **Inputs**:
  - Validation rules (required, max lengths, enums, invariants)
- **Queries**:
  - Arguments (filter/sort/pagination)
  - Error behavior and auth requirements
- **Mutations**:
  - Input, payload/return type
  - Idempotency expectations (if applicable)

**KK guidance**

- Prefer Pothos patterns already used in `packages/api/src/schema/*`.
- If returning lists, prefer Relay-style connections when consistent with existing patterns.

### Prisma data model (only if needed)

Translate the GraphQL contract into data requirements.

- **Models to add/change**:
  - Fields, types, nullability, defaults
  - Relations, onDelete behavior
  - Unique constraints, indexes
- **Migration notes**:
  - Backfills (if required), data consistency, rollout risks

### Resolver / module breakdown (align with KK)

Map schema elements to where they live in KK.

- **Schema module(s)**: which file(s) under `packages/api/src/schema/` to update or add
- **Query fields**: `builder.queryFields(...)` and/or `t.prismaField` / `t.connection` usage
- **Mutation fields**: where to add `builder.mutationFields(...)` and payload types
- **Data access**: Prisma model operations needed
- **Auth scopes**: use existing scopes pattern from builder (`public`, `withAuthor`) or extend only if necessary

### Data flow (high-level)

Describe the end-to-end flow per operation:

- **Request** → **auth** → **validation** → **Prisma read/write** → **return shape**
- Call out:
  - transactions (when multi-write invariants exist)
  - race conditions and uniqueness behavior
  - error mapping (not found, forbidden, conflict, validation)

### Conceptual caching (Redis) — optional

Only describe where caching might help; do **not** implement unless explicitly requested.

- **Candidate keys** (naming shape, TTL concept)
- **Cacheability**: what is safe to cache, invalidation triggers
- **Risks**: staleness, consistency, per-user vs global caching

### Edge cases & risks

- **Correctness**: duplicates, partial failures, concurrent updates
- **AuthZ**: ownership checks, data leakage in relations
- **Performance**: N+1 risks, overfetching, pagination correctness
- **Migration risks**: backfills, constraints, rollout/rollback

### Minimal viable implementation (MVP) plan

Sequenced steps (incremental, safe), starting with schema then data then resolvers:

- **Step 1**: GraphQL schema module stubs (types/inputs/fields)
- **Step 2**: Prisma schema changes (if any)
- **Step 3**: Implement resolver logic with Prisma
- **Step 4**: Add minimal tests / verification plan
- **Step 5**: Add docs/examples for API consumers

### Enhancements (optional)

List follow-ups like:

- richer filtering/sorting
- improved error payloads
- pagination refinements
- conceptual caching upgrades (if later requested)

## Guardrails

- Schema-first: don’t start with DB changes before the GraphQL contract is clear.
- No new infrastructure or libraries unless explicitly required.
- Keep the design consistent with KK’s existing Pothos/Prisma patterns.
- Prefer small, reviewable increments over “big bang” changes.

## Scripts

Use shared sanity checks to validate design readiness:

- `bash apps/web/scripts/prisma-sanity.sh`
  - Verifies Prisma schema validity and client generation before implementation.

Optional local contract check workflow (does not require running the HTTP server):

- `bash .cursor/skills/backend-graphql-feature-design/scripts/graphql-contract-check.sh`
  - Sources `apps/web/.env` when present, dumps SDL from `packages/api` Pothos builder, then runs `graphql-codegen` with `packages/graphql/codegen.local.yml`.
- Manual dump only: `bun --env-file=apps/web/.env .cursor/skills/backend-graphql-feature-design/scripts/dump-graphql-schema.ts --out packages/graphql/.tmp/schema.graphql` (requires `DATABASE_URL` for Prisma during schema construction).
