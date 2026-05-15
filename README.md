# KitchenKin

KitchenKin is a recipe app. This repo is a Bun-workspaces monorepo.

## Layout

```
apps/
  web/                # Next.js 16 app (App Router, Tailwind, shadcn)
  api/                # Standalone GraphQL + mobile auth (Bun + Hono + Apollo Server)
  mobile/             # Expo SDK 55 app (Expo Router, native + web targets)
packages/             # Shared workspace packages (db, api, graphql, shared, auth)
lambda/               # Isolated AWS Lambda handlers (NOT a workspace member)
```

`lambda/*` is deliberately outside the workspace so each function keeps its own `node_modules` and produces a self-contained deployment zip. See [lambda/README.md](lambda/README.md).

## Working on this repo

### Install

There are two install flows:

1. **Workspace install (web, API, mobile, shared packages).** From the repo root:
   ```bash
   bun install
   ```
   This installs deps for everything under `apps/*` and `packages/*` and links workspace packages together.
2. **Lambda packages (only if you're developing/deploying a lambda).** Each lambda is independent:
   ```bash
   cd lambda/<name>
   bun install
   ```

### `.env` files (manual step after pulling the monorepo refactor)

`.env*` files are gitignored. After the monorepo move, Next.js loads `.env` from **`apps/web/`** (where `apps/web/package.json` lives). The standalone API reads **`apps/api/.env`**. If your env files are still at the repo root, move the web one:

```bash
mv .env apps/web/.env
mv .env.eekle apps/web/.env.eekle
```

### Common commands

From the repo root:

```bash
bun run dev               # Next.js (web) + apps/api together
bun run dev:web           # web only (default port 3000)
bun run dev:api           # GraphQL API only (default port 4000)
bun run build             # web production build
bun run lint              # web lint
bun run gql               # @kk/graphql codegen (schema URL in packages/graphql/codegen.yml; needs apps/api up unless you use a local SDL workflow)
bun run prisma-sanity     # validate + generate prisma artifacts
bun run review-packet     # local PR review packet
```

For a **local SDL / contract check** without a running HTTP server, use:

```bash
bash .cursor/skills/backend-graphql-feature-design/scripts/graphql-contract-check.sh
```

Or target a workspace directly:

```bash
bun run --filter @kk/web <script>
bun run --filter @kk/api-server <script>
```

### GraphQL codegen

- **`bun run gql`** (root or `apps/web`) runs **`packages/graphql/codegen.yml`** → output under **`packages/graphql/src/generated/`** (imported as **`@kk/graphql`**). Point the schema URL at a running **`apps/api`** (`http://localhost:4000/graphql` by default), or use the SDL workflow below. Web and mobile should import operations from **`@kk/graphql`** only (no second codegen tree under `apps/web`).

### Lambda packaging

See [lambda/README.md](lambda/README.md). Short version, from inside each lambda package:

```bash
bun run zip:index         # index-only zip (works with Lambda's bundled SDK + layers)
bun run zip               # full zip including node_modules
bun run zip:bundle        # esbuild single-file bundle + zip
```

## Stack

- **Web:** Next.js 16 (App Router), React 19, Tailwind 4, shadcn/radix-ui. By default the GraphQL client uses **`NEXT_PUBLIC_GRAPHQL_URI`** (standalone **`apps/api`**, path **`/graphql`**). Session cookies stay on the web origin; **`POST /api/auth/web-bearer`** mints a short-lived bearer for **cross-origin** API calls. **Recommended for production custom domains:** set **`NEXT_PUBLIC_GRAPHQL_SAME_ORIGIN_PROXY=true`** so the browser calls **`/api/graphql`** on the same host (no CORS preflight to a `*.vercel.app` URL that redirects). On the **web** Vercel project set **`GRAPHQL_UPSTREAM_URL`** to the **stable** API GraphQL URL (server-only; must not redirect on `OPTIONS`). For SSR, set **`NEXT_PUBLIC_APP_ORIGIN`** (or **`AUTH_URL`**) to the public web origin (e.g. `https://www.kitchenkin.app`) so the server builds the correct proxy URL.
- **Mobile:** Expo SDK 55 (Expo Router) + Apollo Client 4, sharing `@kk/graphql`/`@kk/shared`. Defaults to **`http://<dev-host>:4000`** for the API in dev (see `apps/mobile/src/lib/api.ts`).
- **API:** **`apps/api`** — Bun + Hono, Apollo Server 5, Pothos schema from **`packages/api`**, Prisma via **`@kk/db`**, Redis via **`@kk/auth`** token helpers.
- **Auth:** next-auth v5 (beta) on web (database sessions); opaque Redis-backed bearer tokens for mobile and web-bridge tokens (`@kk/auth`).
- **Cache:** ioredis (web adapter/session cache, API token store).
- **Image processing:** AWS Lambda (`@kitchenkin/lambda-image-upload`).
- **Allergen detection:** AWS Lambda + Bedrock (`@kitchenkin/lambda-detect-allergens`).

## Mobile auth env

Mobile Google sign-in hits the **standalone API**, e.g. **`POST http://<api-host>/auth/mobile/oauth/google`**, which verifies a Google `id_token` when `GOOGLE_MOBILE_CLIENT_IDS` is set on the API process.

**API (`apps/api/.env`):**

```bash
# Comma-separated Google OAuth client ids the API will accept in id_token `aud`.
# Register a distinct client per platform in Google Cloud Console: iOS, Android, web/Expo Go.
GOOGLE_MOBILE_CLIENT_IDS="<ios-client-id>,<android-client-id>,<web-client-id>"
```

When unset, **`/auth/mobile/oauth/google`** returns **503** and mobile Google sign-in is disabled.

**Note:** **`POST /auth/mobile/exchange`** (cookie → mobile token pair) is still mounted on **`apps/api`** for API completeness, but the API never sees NextAuth cookies cross-origin, so it returns **401**. KitchenKin mobile today uses **Google `id_token`** + **`/auth/mobile/oauth/google`** only, not cookie exchange.

**Mobile (`apps/mobile/.env`):**

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<web-client-id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios-client-id>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android-client-id>
# Optional — defaults to http://<dev-host>:4000 (see apps/mobile/src/lib/api.ts)
EXPO_PUBLIC_API_BASE=https://api.example.com
```

## Deploy

KitchenKin uses **two Vercel projects** on the same Git repo ([monorepos](https://vercel.com/docs/monorepos)): set each project’s **Root Directory** to `apps/web` (web) and `apps/api` (API). Link both from the repo root with `vercel link --repo` if you use the CLI.

**Prisma Postgres:** create or connect a database from the **web** project’s **Storage** tab, then use the **same** `DATABASE_URL` on both projects. Prefer enabling the connection for **Production** only so preview deploys do not run migrations against prod (`vercel-build` on web runs `prisma migrate deploy`). Recover a lost URL from [Prisma Console](https://console.prisma.io) or Vercel Storage — sensitive values cannot be re-read from the dashboard.

**Deploy order:** redeploy **web** first (migrations + Next build), then **api**.

### Web (`apps/web`)

| Variable | Required | Production |
|----------|----------|------------|
| `DATABASE_URL` | Yes | Prisma Postgres URL (shared with API) |
| `REDIS_URL` | Yes | Production Redis (web-bearer, sessions) |
| `AUTH_URL` | Yes | `https://www.kitchenkin.app` |
| `AUTH_SECRET` | Yes | NextAuth secret |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | If using Google | OAuth console |
| `AUTH_REDDIT_ID`, `AUTH_REDDIT_SECRET` | If using Reddit | OAuth console |
| `AUTH_SENDGRID_KEY` | If using email magic links | SendGrid |
| `NEXT_PUBLIC_APP_ORIGIN` | Yes (with proxy) | `https://www.kitchenkin.app` |
| `NEXT_PUBLIC_GRAPHQL_SAME_ORIGIN_PROXY` | Yes (custom domain) | `true` |
| `GRAPHQL_UPSTREAM_URL` | Yes (with proxy) | `https://<api-host>/graphql` — stable API host, path `/graphql`, no redirect on `OPTIONS` |
| `IMAGE_UPLOAD_ENDPOINT`, `IMAGE_DELETE_ENDPOINT`, `DETECT_ALLERGENS_ENDPOINT` | If using those features | Lambda HTTP URLs |
| `NEXT_PUBLIC_GRAPHQL_URI` | Local dev only | `http://localhost:4000/graphql` — do **not** point prod at `*.vercel.app` if it redirects |
| `SHADOW_DATABASE_URL` | Local `migrate dev` only | Not needed on Vercel |

Local env file: **`apps/web/.env`** (gitignored).

### API (`apps/api`)

Vercel uses [`apps/api/vercel.json`](apps/api/vercel.json) (`bunVersion`) and the `vercel-build` script in [`apps/api/package.json`](apps/api/package.json) (`prisma:generate` only; migrations run on web).

| Variable | Required | Production |
|----------|----------|------------|
| `DATABASE_URL` | Yes | Same as web |
| `REDIS_URL` | Yes | Same as web |
| `CORS_ALLOWED_ORIGINS` | Recommended | `https://www.kitchenkin.app,https://kitchenkin.app` (comma-separated; needed for direct browser/mobile calls) |
| `PORT` | Optional | `4000` (Vercel may inject `PORT`) |
| `GOOGLE_MOBILE_CLIENT_IDS` | If using mobile Google sign-in | Comma-separated client ids |

Local env file: **`apps/api/.env`** (gitignored).

### Verify production

- Browser GraphQL requests go to **`https://www.kitchenkin.app/api/graphql`**, not a separate `*.vercel.app` host.
- **`GRAPHQL_UPSTREAM_URL`** matches the deployed API project’s `/graphql` endpoint.

- **Lambdas** are manually deployed (see [lambda/README.md](lambda/README.md)).
