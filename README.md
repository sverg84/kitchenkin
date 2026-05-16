# KitchenKin

KitchenKin is a recipe app. This repo is a Bun-workspaces monorepo.

## Layout

```
apps/
  web/                # Next.js 16 app (App Router, Tailwind, shadcn); hosts Better Auth `/api/auth`
  api/                # Standalone GraphQL (Bun + Hono + Apollo Server)
  mobile/             # Expo SDK 55 app (Expo Router, native + web targets)
packages/             # Shared workspace packages (db, api, graphql, shared, auth with Better Auth)
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

- **Web:** Next.js 16 (App Router), React 19, Tailwind 4, shadcn/radix-ui. GraphQL defaults to **`NEXT_PUBLIC_GRAPHQL_URI`** (standalone **`apps/api`**). Prefer **`NEXT_PUBLIC_GRAPHQL_SAME_ORIGIN_PROXY=true`** so browsers call **`/api/graphql`** on the web origin; the route forwards **`Cookie`** to **`GRAPHQL_UPSTREAM_URL`** (server-only stable API URL). Set **`NEXT_PUBLIC_APP_ORIGIN`** for SSR-built proxy URLs.

- **Mobile:** Expo SDK 55 + Apollo Client 4, sharing `@kk/graphql` / `@kk/shared`. **`EXPO_PUBLIC_AUTH_ORIGIN`** must point at the Next app (Better Auth). GraphQL defaults to **`${EXPO_PUBLIC_AUTH_ORIGIN}/api/graphql`** when **`EXPO_PUBLIC_GRAPHQL_URI`** is unset — requests send the Better Auth session **`Cookie`** and **`expo-origin`**.

- **API:** **`apps/api`** — Bun + Hono, Apollo Server 5, Pothos schema from **`packages/api`**, Prisma via **`@kk/db`**.

- **Auth:** **Better Auth** in **`packages/auth`**: **`@kk/auth/next`** (+ `nextCookies()` last) for Next; **`@kk/auth/server`** for **`apps/api`**. Sessions are persisted with Prisma (see migration **`20260516200000_better_auth`**). OAuth (Google initially): register redirect **`{webOrigin}/api/auth/callback/google`**.

- **Cache:** Legacy Redis bearer flows were removed from local web/API bundles; Redis may still appear in other infra if reintroduced for caching elsewhere.

- **Image processing:** AWS Lambda (`@kitchenkin/lambda-image-upload`).
- **Allergen detection:** AWS Lambda + Bedrock (`@kitchenkin/lambda-detect-allergens`).

## Mobile auth env

Mobile signs in via **Better Auth on the Next app** (`EXPO_PUBLIC_AUTH_ORIGIN`). After OAuth, Apollo sends the persisted session **`cookie`** plus **`expo-origin`** header to GraphQL (`/api/graphql` on that same origin unless overridden).

**Mobile (`apps/mobile/.env`):**

```bash
EXPO_PUBLIC_AUTH_ORIGIN=http://YOUR_LAN_IP:3000 # or prod https://www.example.com — must match Better Auth baseURL/trusted origins
EXPO_PUBLIC_GRAPHQL_URI=http://YOUR_LAN_IP:3000/api/graphql # optional; defaults from AUTH_ORIGIN + /api/graphql
EXPO_PUBLIC_API_BASE=http://YOUR_LAN_IP:4000              # fallback when GRAPHQL_URI and AUTH_ORIGIN are unset (direct API ; no session cookie)
```

## Deploy

KitchenKin uses **two Vercel projects** on the same Git repo ([monorepos](https://vercel.com/docs/monorepos)): set each project’s **Root Directory** to `apps/web` (web) and `apps/api` (API). Link both from the repo root with `vercel link --repo` if you use the CLI.

**Prisma Postgres:** create or connect a database from the **web** project’s **Storage** tab, then use the **same** `DATABASE_URL` on both projects. Prefer enabling the connection for **Production** only so preview deploys do not run migrations against prod (`vercel-build` on web runs `prisma migrate deploy`). Recover a lost URL from [Prisma Console](https://console.prisma.io) or Vercel Storage — sensitive values cannot be re-read from the dashboard.

**Deploy order:** redeploy **web** first (migrations + Next build), then **api**.

### Web (`apps/web`)

| Variable | Required | Production |
|----------|----------|------------|
| `DATABASE_URL` | Yes | Prisma Postgres URL (shared with API) |
| `NEXT_PUBLIC_APP_ORIGIN` | Yes (recommended) | `https://www.kitchenkin.app` — also used by Better Auth client when set |
| `AUTH_URL` | Optional | Fallback for Better Auth **`baseURL`** when other vars unset |
| `AUTH_SECRET` | Yes | Strong secret for Better Auth (≥32 chars recommended) |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Yes (OAuth today) | Web Google OAuth; redirect **`{origin}/api/auth/callback/google`** |
| `NEXT_PUBLIC_GRAPHQL_SAME_ORIGIN_PROXY` | Yes (custom domain) | `true` |
| `GRAPHQL_UPSTREAM_URL` | Yes (with proxy) | `https://<api-host>/graphql` |
| `IMAGE_UPLOAD_ENDPOINT`, `IMAGE_DELETE_ENDPOINT`, `DETECT_ALLERGENS_ENDPOINT` | If using those features | Lambda HTTP URLs |
| `NEXT_PUBLIC_GRAPHQL_URI` | Local dev only | Direct API URL |
| `SHADOW_DATABASE_URL` | Local `migrate dev` only | Not needed on Vercel |

Local env file: **`apps/web/.env`** (gitignored).

### API (`apps/api`)

Vercel uses [`apps/api/vercel.json`](apps/api/vercel.json) (`bunVersion`) and the `vercel-build` script in [`apps/api/package.json`](apps/api/package.json) (`prisma:generate`, then `bun build` to `src/app.bundle.js` plus a thin `src/index.ts` stub for the Hono builder; other `src/*.ts` removed on Vercel). For local packaging checks, run `VERCEL=1 bunx vercel build` from `apps/api`. Migrations run on web.

| Variable | Required | Production |
|----------|----------|------------|
| `DATABASE_URL` | Yes | Same as web |
| `CORS_ALLOWED_ORIGINS` | Recommended | Origins allowed for credentialed browser calls (comma-separated); include mobile dev hosts if debugging from a device browser |
| `PORT` | Optional | `4000` (Vercel may inject `PORT`) |

Local env file: **`apps/api/.env`** (gitignored).

### Verify production

- Browser GraphQL requests go to **`https://www.kitchenkin.app/api/graphql`**, not a separate `*.vercel.app` host.
- **`GRAPHQL_UPSTREAM_URL`** matches the deployed API project’s `/graphql` endpoint.

- **Lambdas** are manually deployed (see [lambda/README.md](lambda/README.md)).
