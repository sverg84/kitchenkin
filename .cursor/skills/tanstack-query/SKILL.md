---
name: tanstack-query
description: KitchenKin patterns for TanStack Query on web (Next.js) and mobile (Expo). Use for useInfiniteQuery, query keys, SSR providers, REST api-client, and mobile auth headers.
---

# TanStack Query (KitchenKin)

## Shared layer (`@kk/shared`)

- **`queryKeys`** — `packages/shared/src/api/query-keys.ts`
- **`createApiClient` / `webApiClient`** — `packages/shared/src/api-client.ts`
- **Response types** — `RecipeDTO`, `RecipeConnection` from `packages/shared/src/api/`

## Web

- **Provider**: `apps/web/src/app/providers.tsx` + `getQueryClient()` in `apps/web/src/lib/query/get-query-client.ts`
- **Hooks**: `apps/web/src/lib/query/hooks/` — e.g. `useRecipes(search)` with `useInfiniteQuery`
- **Browser fetch**: `webApiClient.get('/api/recipes', { searchParams, credentials: 'include' })`
- **Search + infinite scroll**: read `search` from `useSearchParams()`; include in `queryKey` so URL changes refetch

```ts
getNextPageParam: (last) =>
  last.pageInfo.hasNextPage ? last.pageInfo.endCursor : undefined,
```

## Mobile

- **Provider**: `QueryClientProvider` in `apps/mobile/src/app/_layout.tsx`
- **API client**: `apps/mobile/src/lib/api-client.ts` — base `{EXPO_PUBLIC_AUTH_ORIGIN}/api`, headers: `cookie` + `expo-origin`
- **Hooks**: `apps/mobile/src/lib/query/hooks/use-recipes.ts`
- **Sign out**: `queryClient.clear()` in account screen

## SSR notes

- `staleTime: 60_000` in query client defaults
- Prefer RSC for static/detail content; TanStack for interactive lists only
