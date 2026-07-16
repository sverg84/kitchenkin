# KitchenKin

KitchenKin is a recipe app. This repo is a Bun-workspaces monorepo.

## Layout

```
apps/
  web/                # Next.js 16 — App Router, REST /api, Better Auth, Server Actions
  mobile/             # Expo SDK 55 — TanStack Query + REST against web /api
packages/
  domain/             # @kk/domain — server-only Prisma services
  aws/                # @kk/aws — Bedrock allergen detect + S3 image delete (server-only)
  shared/             # @kk/shared — Zod API schemas, api-client, query keys
  db/                 # Prisma
  auth/               # Better Auth
lambda/               # AWS Lambda handlers (NOT a workspace member; image-upload active)
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
- **AWS:** Allergen detection (Bedrock) and image delete (S3) via `@kk/aws` in the Next.js server. Image upload still uses a Lambda Function URL (`IMAGE_UPLOAD_ENDPOINT`).

## Mobile env

```bash
EXPO_PUBLIC_AUTH_ORIGIN=http://YOUR_LAN_IP:3000
```

On simulator: `http://127.0.0.1:3000`. See [apps/mobile/README.md](apps/mobile/README.md).

## Deploy

Single Vercel project with **Root Directory** `apps/web`. Set `DATABASE_URL`, `AUTH_*`, `REDIS_URL`, AWS credentials for `@kk/aws`, and `IMAGE_UPLOAD_ENDPOINT` on the web project.

Use a dedicated IAM user (not root) with least privilege for `@kk/aws`:

- **Bedrock** — app calls the **global** inference profile `global.anthropic.claude-haiku-4-5-20251001-v1:0` (default client region `us-west-2`). Grant `bedrock:InvokeModel` on:
  - Inference profile: `arn:aws:bedrock:us-west-2:<ACCOUNT_ID>:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0`
  - In-region foundation model: `arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0`
  - Global foundation model (cross-Region destinations): `arn:aws:bedrock:::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0`
  - Scope the two foundation-model statements with condition `bedrock:InferenceProfileArn` equal to the inference-profile ARN above (and `aws:RequestedRegion: unspecified` on the global FM statement). See [Global cross-Region inference](https://docs.aws.amazon.com/bedrock/latest/userguide/global-cross-region-inference.html).
- **S3** — `s3:ListBucket` / `s3:DeleteObject` on `kitchenkin` and `kitchenkin-local`.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Prisma Postgres |
| `AUTH_SECRET`, OAuth client IDs/secrets | Better Auth |
| `REDIS_URL` | Session secondary storage |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | IAM user for Bedrock + S3 delete (via `@kk/aws`) |
| `AWS_BEDROCK_REGION` | Optional; default `us-west-2` |
| `AWS_S3_REGION` | Optional; default `us-west-1` |
| `AWS_S3_BUCKET` | Required in production/preview (and any non-`development` `NODE_ENV`); defaults to `kitchenkin-local` only when `NODE_ENV=development` |
| `IMAGE_UPLOAD_ENDPOINT` | Image-upload Lambda Function URL |

`DETECT_ALLERGENS_ENDPOINT` and `IMAGE_DELETE_ENDPOINT` are no longer read by the app (logic moved to `@kk/aws`). Keep those Lambdas deployed only if you need rollback.

OAuth redirects: `{origin}/api/auth/callback/google` and `/callback/reddit`.

Image-upload Lambda is deployed manually ([lambda/README.md](lambda/README.md)).
