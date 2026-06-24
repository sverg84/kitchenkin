# KitchenKin Mobile (Expo)

In the **KitchenKin** monorepo, install and run from the **repository root** with [Bun](https://bun.sh):

```bash
cd /path/to/kitchenkin
bun install
bun run dev:web    # Next.js web app (:3000) — serves /api REST + /api/auth
cd apps/mobile && bunx expo start
```

## Environment

Set in `apps/mobile/.env` (or Expo env):

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_AUTH_ORIGIN` | Web app origin (e.g. `http://192.168.1.x:3000` on device, `http://127.0.0.1:3000` on simulator) |

Mobile calls `{EXPO_PUBLIC_AUTH_ORIGIN}/api/*` for recipes and `{EXPO_PUBLIC_AUTH_ORIGIN}/api/auth/*` for Better Auth. No separate GraphQL API server is required.

See [docs/api.md](../../docs/api.md) for REST contract details.

## Development

```bash
bunx expo start
```

Use Expo Go or a development build. On a physical device, set `EXPO_PUBLIC_AUTH_ORIGIN` to your machine's LAN IP so the device can reach the web dev server.
