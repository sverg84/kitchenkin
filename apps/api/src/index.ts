import { Hono } from "hono";

import { mobileAuthHandlers } from "./auth";
import { apiCors } from "./cors";
import { env } from "./env";
import { graphqlHandler } from "./graphql";

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

app.on(["GET", "POST"], "/graphql", graphqlHandler);

app.post("/auth/mobile/exchange", (c) =>
  mobileAuthHandlers.exchange(c.req.raw),
);
app.post("/auth/mobile/refresh", (c) => mobileAuthHandlers.refresh(c.req.raw));
app.post("/auth/mobile/logout", (c) => mobileAuthHandlers.logout(c.req.raw));
app.post("/auth/mobile/oauth/google", (c) =>
  mobileAuthHandlers.oauthGoogle(c.req.raw),
);

console.log(`[api] listening on http://localhost:${env.port}`);

export default {
  port: env.port,
  fetch: app.fetch,
};
