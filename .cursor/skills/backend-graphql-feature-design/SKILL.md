---
name: backend-graphql-feature-design
description: Designs backend features using a GraphQL-first approach for KitchenKin (KK). Use when adding/changing GraphQL types/queries/mutations, designing API contracts, mapping GraphQL to Prisma models, outlining resolver/service/DB data flow, or considering Redis caching conceptually (without implementing it unless asked).
---

# Backend Feature Design (GraphQL-first)

Design backend features using a GraphQL-first approach.

Start by defining the GraphQL schema changes, including types, inputs, queries, and mutations. Define the intended API contract clearly. Outline required data models and translate them into Prisma schema changes if needed. Define high-level data flow between API layer, services, and database. Identify where caching (Redis) may be useful conceptually, but do not implement it unless explicitly required. Ensure the design aligns with existing KK backend architecture and avoids introducing unnecessary new abstractions.

## KK architecture touchpoints (use these patterns)

- **GraphQL server entrypoint**: `src/app/api/graphql/route.ts` (Apollo Server on Next.js route)
- **Schema construction**: Pothos builder in `src/lib/graphql/schema-builder/`
  - Base builder: `src/lib/graphql/schema-builder/builder.ts`
  - Feature modules: `src/lib/graphql/schema-builder/*.ts` (e.g. `recipe.ts`)
  - Import registry: `src/lib/graphql/schema-builder/index.ts` (adds modules, exports builder)
- **Prisma schema**: `prisma/schema.prisma`
- **Redis client**: `src/lib/redis.ts` (use only for conceptual caching notes unless asked)

**Avoid new abstractions**: prefer adding to the existing Pothos schema-builder modules and using Prisma directly in resolvers unless KK already has a service layer for that domain.

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
- Prefer Pothos patterns already used in `src/lib/graphql/schema-builder/*`.
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

- **Schema module(s)**: which file(s) under `src/lib/graphql/schema-builder/` to update or add
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

- `bash scripts/prisma-sanity.sh`
  - Verifies Prisma schema validity and client generation before implementation.

Optional local contract check workflow (does not require running the app server):
- `bun .cursor/skills/backend-graphql-feature-design/scripts/dump-graphql-schema.ts --out .tmp/schema.graphql`
- `bash .cursor/skills/backend-graphql-feature-design/scripts/graphql-contract-check.sh`
  - Uses `codegen.local.yml` so default `codegen.yml` remains unchanged.

