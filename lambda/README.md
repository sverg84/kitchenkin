# Lambda Packages

This directory contains repo-owned AWS Lambda handlers for KitchenKin.

## App integration (current)

| Function           | Package Folder             | Handler         | Called by app? | App env / module |
| ------------------ | -------------------------- | --------------- | -------------- | ---------------- |
| Image upload       | `lambda/image-upload/`     | `index.handler` | **Yes**        | `IMAGE_UPLOAD_ENDPOINT` via [`packages/domain/src/integrations/lambda.ts`](../packages/domain/src/integrations/lambda.ts) |
| Allergen detection | `lambda/detect-allergens/` | `index.handler` | **No** (rollback only) | Replaced by `@kk/aws` (`detectAllergens`) |
| Image delete       | `lambda/image-delete/`     | `index.handler` | **No** (rollback only) | Replaced by `@kk/aws` (`deleteImageInS3`) |

`detect-allergens` and `image-delete` remain in this repo for rollback. The live app uses `@kk/aws` (Bedrock + S3 SDK) from `@kk/domain` recipe mutations. You can leave the Function URLs deployed until you are confident with the in-repo path; then decommission those two functions in AWS.

**Image upload:** In AWS, attach the **`S3ImageProcessDeps`** Lambda layer (Node 22.x / x86_64); it provides **`sharp`** at runtime. This repo lists **`sharp`** under **`devDependencies`** so `bun run install:prod` omits it from the deployment zip. The **`bundle`** script passes **`--external:sharp`** so `bun run zip:bundle` inlines the S3 client but leaves `import "sharp"` to the layer. To run `lambda/image-upload/index.mjs` locally, use **`bun install`** (without `--production`) in that folder so `sharp` is installed.

## Runtime and Packaging

- Target Node runtime: `22.x` (see each package's `engines` field).
- **`bun run zip:index`** (recommended for these functions): writes **`dist/function-index.zip`** containing **only** `index.mjs` at the archive root (handler stays **`index.handler`**). Use this when relying on the **Lambda Node.js 22 runtime–included AWS SDK for JavaScript v3** and any layers (**`S3ImageProcessDeps`** for **`sharp`** on image-upload). No `install:prod` needed to produce the artifact.
- **`bun run zip`**: full deployment package with `node_modules` (after **`bun run install:prod`**).
- **`bun run bundle`** / **`bun run zip:bundle`**: single-file esbuild output + zip (self-contained SDK in the bundle unless externals apply).

See [Runtime-included SDK versions (Node.js)](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html#nodejs-sdk-included) for the pinned SDK v3 minor on Lambda.

## Manual Deployment (Current Scope)

### 1) Build a package

Example for image upload (index-only zip):

```bash
cd "/Users/stephenvergara/Documents/GitHub/kitchenkin/lambda/image-upload"
bun run zip:index
```

### 2) Upload to AWS Lambda

- Console: Lambda -> Code -> Update -> Update from .zip file
- CLI:

```bash
aws lambda update-function-code \
  --function-name kitchenkin-image-upload \
  --zip-file fileb://dist/function-index.zip
```

Repeat for rollback-only packages (`detect-allergens`, `image-delete`) only if you still need those Function URLs.

## IAM Notes

- All functions: CloudWatch logs permissions (`logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`).
- `detect-allergens` (rollback): `bedrock:InvokeModel` on the selected model.
- `image-upload`: S3 permissions for listing and writing objects in the target bucket(s) (`s3:ListBucket`, `s3:PutObject`).
- `image-delete` (rollback): S3 permissions for listing and deleting objects (`s3:ListBucket`, `s3:DeleteObject`).

For the Next.js app (`@kk/aws`), grant the dedicated IAM user the same Bedrock + S3 delete permissions; credentials live in `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` on Vercel / `apps/web/.env`.

## Out of Scope for Now

Automated redeployment (GitHub Actions, SAM/CDK, or CodePipeline) is intentionally out of scope. The current flow is manual packaging plus manual upload per function.
