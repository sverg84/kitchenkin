# KitchenKin

KitchenKin is a recipe app. This repo is a Bun-workspaces monorepo.

## Layout

```
apps/
  web/                # Next.js 16 — App Router, REST /api, Better Auth, Server Actions
  mobile/             # Expo SDK 55 — TanStack Query + REST against web /api
packages/
  domain/             # @kk/domain — server-only Prisma services
  shared/             # @kk/shared — Zod API schemas, api-client, query keys
  db/                 # Prisma
  auth/               # Better Auth
lambda/               # AWS Lambda handlers (NOT a workspace member)
```

REST API contract: [docs/api.md](docs/api.md).

`lambda/*` is outside the workspace. See [lambda/README.md](lambda/README.md).

## Working on this repo

### Install

```bash
bun install
```

Lambda packages install separately inside each `lambda/<name>` folder.

### Environment

Next.js loads `.env` from **`apps/web/`**. Mobile uses **`apps/mobile/.env`** for `EXPO_PUBLIC_AUTH_ORIGIN`.

### Common commands

```bash
bun run dev               # Next.js web only (:3000)
bun run build             # web production build
bun run lint              # web lint
bun run prisma-sanity     # validate + generate prisma artifacts
bun run review-packet     # local PR review packet
```

REST contract smoke check (web must be running):

```bash
bash .cursor/skills/backend-rest-api-design/scripts/rest-contract-check.sh
```

Mobile (separate terminal):

```bash
cd apps/mobile && bunx expo start
```

## Stack

- **Web:** Next.js 16, React 19, Tailwind 4, shadcn/radix-ui. RSC + `@kk/domain` for server reads; Server Actions for form writes; TanStack Query for client islands (`useInfiniteQuery` on `/api/recipes`).
- **Mobile:** Expo SDK 55, TanStack Query, `@kk/shared` api-client → `{EXPO_PUBLIC_AUTH_ORIGIN}/api/*`.
- **Data:** Prisma via `@kk/db`; business logic in `@kk/domain` (server-only).
- **Auth:** Better Auth on web at `/api/auth/*` (`@kk/auth/next` with `nextCookies()`). Mobile uses `expoClient` + session cookie on REST requests.
- **Lambdas:** image upload, allergen detection (see `lambda/`).

## Mobile env

```bash
EXPO_PUBLIC_AUTH_ORIGIN=http://YOUR_LAN_IP:3000
```

On simulator: `http://127.0.0.1:3000`. See [apps/mobile/README.md](apps/mobile/README.md).

## Deploy

Single Vercel project with **Root Directory** `apps/web`. Set `DATABASE_URL`, `AUTH_*`, `REDIS_URL`, and Lambda endpoint URLs on the web project.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Prisma Postgres |
| `AUTH_SECRET`, OAuth client IDs/secrets | Better Auth |
| `REDIS_URL` | Session secondary storage |
| `IMAGE_UPLOAD_ENDPOINT`, `IMAGE_DELETE_ENDPOINT`, `DETECT_ALLERGENS_ENDPOINT` | Lambda HTTP URLs |

OAuth redirects: `{origin}/api/auth/callback/google` and `/callback/reddit`.

Lambdas are deployed manually ([lambda/README.md](lambda/README.md)).
