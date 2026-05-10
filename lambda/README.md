# Lambda Packages

This directory contains repo-owned AWS Lambda handlers for KitchenKin.

## Functions and Endpoint Mapping

| Function | Package Folder | Handler | App Env Var |
| --- | --- | --- | --- |
| Allergen detection | `lambda/detect-allergens/` | `index.handler` | `DETECT_ALLERGENS_ENDPOINT` |
| Image upload | `lambda/image-upload/` | `index.handler` | `IMAGE_UPLOAD_ENDPOINT` |
| Image delete | `lambda/image-delete/` | `index.handler` | `IMAGE_DELETE_ENDPOINT` |

All three endpoint env vars are read by `src/lib/lambda/index.ts`.
For each environment (local, staging, production), point those env vars to the corresponding Lambda Function URL (or API Gateway URL).

**Image upload:** In AWS, attach the **`S3ImageProcessDeps`** Lambda layer (Node 22.x / x86_64); it provides **`sharp`** at runtime. This repo lists **`sharp`** under **`devDependencies`** so `bun run install:prod` omits it from the deployment zip. The **`bundle`** script passes **`--external:sharp`** so `bun run zip:bundle` inlines the S3 client but leaves `import "sharp"` to the layer. To run `lambda/image-upload/index.mjs` locally, use **`bun install`** (without `--production`) in that folder so `sharp` is installed.

## Runtime and Packaging

- Target Node runtime: `22.x` (see each package's `engines` field).
- Each package has:
  - `bun run install:prod` to install runtime dependencies.
  - `bun run zip` to create `dist/function.zip`.
  - `bun run bundle` and `bun run zip:bundle` for a bundled artifact option.

## Manual Deployment (Current Scope)

### 1) Build a package

Example for allergen detection:

```bash
cd "/Users/stephenvergara/Documents/GitHub/kitchenkin/lambda/detect-allergens"
bun run install:prod
bun run zip
```

### 2) Upload to AWS Lambda

- Console: Lambda -> Code -> Update -> Update from .zip file
- CLI:

```bash
aws lambda update-function-code \
  --function-name kitchenkin-detect-allergens \
  --zip-file fileb://dist/function.zip
```

Repeat for `image-upload` and `image-delete` with their function names and zip files.

## IAM Notes

- All functions: CloudWatch logs permissions (`logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`).
- `detect-allergens`: `bedrock:InvokeModel` on the selected model.
- `image-upload`: S3 permissions for listing and writing objects in the target bucket(s) (`s3:ListBucket`, `s3:PutObject`).
- `image-delete`: S3 permissions for listing and deleting objects (`s3:ListBucket`, `s3:DeleteObject`).

## Out of Scope for Now

Automated redeployment (GitHub Actions, SAM/CDK, or CodePipeline) is intentionally out of scope. The current flow is manual packaging plus manual upload per function.
