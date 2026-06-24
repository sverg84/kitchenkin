---
name: frontend-feature-implementation
description: Implements frontend features in KK’s Next.js app using Tailwind CSS and existing shadcn/radix-ui components. Use when adding UI, wiring TanStack Query or RSC/domain data, defining component/state/data flow, or ensuring accessibility without new UI frameworks.
---

# Frontend Feature Implementation (Next.js + Tailwind + shadcn/radix-ui)

Implement frontend features in the Next.js app using Tailwind CSS and shadcn/radix-ui components.

## KK frontend touchpoints

- **App Router pages**: `apps/web/src/app/**/page.tsx` — prefer RSC + `@kk/domain` for server reads.
- **Feature components**: `apps/web/src/components/**`
- **UI primitives**: `apps/web/src/components/ui/**`
- **TanStack Query**: `apps/web/src/lib/query/hooks/**`, `apps/web/src/app/providers.tsx`
- **Shared client layer**: `@kk/shared` — `api-client`, `queryKeys`, `RecipeDTO` types
- **Server Actions (web writes)**: `apps/web/src/lib/prisma/server-actions.ts`
- **REST API contract**: `docs/api.md`

## Data fetching patterns

| Use case | Pattern |
|----------|---------|
| Server-rendered detail page | RSC calls `@kk/domain` directly |
| Interactive lists / infinite scroll | `"use client"` + `useInfiniteQuery` + `/api/*` |
| Form create/update | Server Actions → `@kk/domain` |
| URL-driven search | `?search=` in router; include `search` in TanStack `queryKey` |

Mobile uses the same REST routes via `@kk/shared` `createApiClient` — see `.cursor/skills/tanstack-query/SKILL.md`.

## Implementation workflow

1. Identify UI changes + loading/empty/error states
2. Choose RSC vs client island (TanStack) per table above
3. Use existing shadcn components; match Tailwind patterns in neighboring files
4. After Server Action writes: `revalidatePath` + optional `queryClient.invalidateQueries(queryKeys.recipes.*)`
