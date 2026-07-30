# KitchenKin REST API

Authoritative contract for HTTP routes under `apps/web/src/app/api/`. Mobile and web client islands call these endpoints; RSC pages and Server Actions may call `@kk/domain` directly without HTTP.

## Conventions

| Concern | Convention |
| --- | --- |
| Base path | `/api` (same origin on web; `{EXPO_PUBLIC_AUTH_ORIGIN}/api` on mobile) |
| Auth | Session cookie from Better Auth (`/api/auth/*`). Route handlers use `auth()` from `apps/web/auth.ts`. |
| Mobile headers | `Cookie` (Better Auth session) + `expo-origin` (same as Apollo today) |
| Errors | `{ "error": string, "code"?: string }` with HTTP 400/401/403/404/500 |
| IDs | Prisma `id` (cuid) in all JSON — no `rawId` |
| Pagination | `?first=24&after=<base64url-cursor>` |

## Pagination

Cursor is base64url-encoded JSON: `{ "createdAt": "<ISO8601>", "id": "<cuid>" }`.

Connection response shape (for TanStack `useInfiniteQuery`):

```json
{
  "edges": [{ "cursor": "...", "node": { /* RecipeDTO */ } }],
  "pageInfo": {
    "hasNextPage": true,
    "hasPreviousPage": false,
    "startCursor": "...",
    "endCursor": "..."
  },
  "exists": true
}
```

## Endpoints

### `GET /api/recipes`

Public recipe search/list.

| Query | Type | Default | Description |
| --- | --- | --- | --- |
| `first` | number | 24 | Page size |
| `after` | string | — | Cursor from previous page |
| `search` | string | — | Case-insensitive title/description filter |

**Response:** `RecipeConnection` (see Zod `recipeConnectionSchema` in `@kk/shared`).

### `GET /api/recipes/mine`

Authenticated user's authored recipes. **401** if no session.

| Query | `first`, `after` |

**Response:** `RecipeConnection`

### `GET /api/recipes/favorites`

Authenticated user's favorited recipes. **401** if no session.

| Query | `first`, `after` |

**Response:** `RecipeConnection`

### `GET /api/recipes/:id`

Public recipe detail.

**Response:** `RecipeDTO`  
**404:** `{ "error": "Recipe not found", "code": "NOT_FOUND" }`

### `POST /api/recipes`

Create recipe (mobile). **401** if no session.

**Body:** `CreateRecipeInput` (Zod `createRecipeInputSchema` in `@kk/shared`). Includes `tags: RecipeTag[]` (default `[]`). When `tags` is empty on create, the server AI-fills from the closed allowlist.

**Response:** `{ "id": "<cuid>" }` with **201**

### `PATCH /api/recipes/:id`

Update recipe (mobile). **401** / **403** if not author.

**Body:** `UpdateRecipeInput` (partial; `id` required). If `tags` is omitted, existing tags are unchanged. If `tags` is `[]`, the server AI-fills. If `tags` is non-empty, those values are persisted as-is.

**Response:** `{ "id": "<cuid>" }`

### `DELETE /api/recipes/:id`

Delete recipe (mobile). **401** / **403** if not author.

**Response:** `{ "success": true }`

### `POST /api/recipes/:id/favorite`

Toggle favorite for current user. **401** if no session.

**Response:** `{ "favorited": boolean }`

### `POST /api/image-upload`

Authenticated Lambda proxy for recipe form image upload. **401** if no session.

| Body | `multipart/form-data` with field `image` (file) |
| Response | `{ "id": string, "src": string }` (Lambda WebP + CloudFront URL) |
| Errors | **400** if `image` missing; **401** without session |

The Lambda Function URL itself stays unauthenticated; this Next.js route is the auth gate.

## Types

Zod schemas and inferred TypeScript types live in `packages/shared/src/api/`. Key exports:

- `RecipeDTO` — list card + detail fields (includes `tags: RecipeTag[]`)
- `RecipeConnection`
- `paginationQuerySchema`
- `recipeTagSchema` / `RECIPE_TAG_LABELS` — closed tag allowlist

## Client patterns

### Web browser

```ts
fetch("/api/recipes?first=24", { credentials: "include" });
```

### Mobile (Expo)

Attach session cookie from Better Auth SecureStore and `expo-origin` header via `@kk/shared` `api-client`.

### URL-driven search (web home)

Search updates `?search=` via Next.js router. TanStack `useInfiniteQuery` `queryKey` must include `search` from `useSearchParams()` so changing the URL refetches from page 1.

## Environment variables (post-migration)

| Variable | App | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | web | Prisma |
| `REDIS_URL` | web | Optional cache |
| `BETTER_AUTH_*` | web | Auth |
| `EXPO_PUBLIC_AUTH_ORIGIN` | mobile | Web origin for API + auth |
| `IMAGE_UPLOAD_ENDPOINT` | web | Lambda |
| `IMAGE_DELETE_ENDPOINT` | web | Lambda |
| `DETECT_ALLERGENS_ENDPOINT` | web | Lambda |

**Removed after migration:** `GRAPHQL_*`, `NEXT_PUBLIC_GRAPHQL_*`, `EXPO_PUBLIC_GRAPHQL_*`, `CORS_ALLOWED_ORIGINS` (api-only), `GRAPHQL_UPSTREAM_URL`
