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

const localServer = {
  port: env.port,
  fetch: app.fetch,
};

if (!process.env.VERCEL) {
  console.log(`[api] listening on http://localhost:${env.port}`);
}

export default process.env.VERCEL ? { fetch: app.fetch } : localServer;
