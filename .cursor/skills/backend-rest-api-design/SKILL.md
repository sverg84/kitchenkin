---
name: backend-rest-api-design
description: Designs REST API contracts for KitchenKin. Use when adding or changing /api routes, request/response shapes, pagination, or auth requirements. Contract lives in docs/api.md and Zod schemas in packages/shared/src/api/.
---

# Backend REST API design (KitchenKin)

## Start here

1. Read [docs/api.md](../../../docs/api.md) for paths, auth, pagination, and error conventions.
2. Add or update Zod schemas in `packages/shared/src/api/` — infer TypeScript types from Zod.
3. Implement domain logic in `@kk/domain` (server-only); route handlers in `apps/web/src/app/api/` call domain functions.

## Rules

- Route handlers resolve auth with `auth()` from `apps/web/auth.ts`, then pass `userId` into `@kk/domain`.
- `@kk/domain` must not import Next.js or `@kk/auth/next`.
- Clients use `@kk/shared` `api-client` + TanStack Query — never import `@kk/domain` from `"use client"` modules.
- Use Prisma `id` in JSON — no `rawId`.
- Cursor pagination: `?first=24&after=<base64url>` — port logic from domain `recipes/cursor.ts`.

## Writes

- Web forms: Server Actions → `@kk/domain` (preferred for web).
- Mobile / client islands: REST routes wrapping the same domain functions.
