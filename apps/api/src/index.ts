import { Hono } from "hono";

import { apiCors } from "./cors";
import { env } from "./env";
/**
 * Bun + Hono entry point for the standalone KitchenKin API.
 *
 * Routes:
 *   GET  /healthz                       — liveness probe
 *   GET  /graphql                       — GraphQL queries / introspection
 *   POST /graphql                       — GraphQL queries / mutations
 *   POST /auth/mobile/exchange          — cookie -> bearer (401 here: API has no session cookie)
 *   POST /auth/mobile/refresh           — rotate access/refresh token pair
 *   POST /auth/mobile/logout            — revoke session
 *   POST /auth/mobile/oauth/google      — verify Google id_token, issue bearer pair
 */
const app = new Hono();

app.use("*", apiCors);

app.get("/healthz", (c) =>
  c.json({
    status: "ok",
    service: "@kk/api-server",
    env: env.nodeEnv,
  }),
);

app.on(["GET", "POST"], "/graphql", async (c) => {
  const { graphqlHandler } = await import("./graphql");
  return graphqlHandler(c);
});

app.post("/auth/mobile/exchange", async (c) => {
  const { mobileAuthHandlers } = await import("./auth");
  return mobileAuthHandlers.exchange(c.req.raw);
});
app.post("/auth/mobile/refresh", async (c) => {
  const { mobileAuthHandlers } = await import("./auth");
  return mobileAuthHandlers.refresh(c.req.raw);
});
app.post("/auth/mobile/logout", async (c) => {
  const { mobileAuthHandlers } = await import("./auth");
  return mobileAuthHandlers.logout(c.req.raw);
});
app.post("/auth/mobile/oauth/google", async (c) => {
  const { mobileAuthHandlers } = await import("./auth");
  return mobileAuthHandlers.oauthGoogle(c.req.raw);
});

/**
 * Local `bun run` uses Bun.serve on `{ port, fetch }`. Vercel's Bun runtime
 * invokes `fetch` only — `Bun.serve` is unsupported there; including `port`
 * can crash the function before any route runs (FUNCTION_INVOCATION_FAILED).
 */
const localServer = {
  port: env.port,
  fetch: app.fetch,
};

if (!process.env.VERCEL) {
  console.log(`[api] listening on http://localhost:${env.port}`);
}

export default process.env.VERCEL ? { fetch: app.fetch } : localServer;
