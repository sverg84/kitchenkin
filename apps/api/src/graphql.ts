import type { ApolloServer } from "@apollo/server";
import type { GraphQLContext } from "@kk/api";
import type { Context } from "hono";
import { resolveUser } from "./context";

let serverPromise: Promise<ApolloServer<GraphQLContext>> | undefined;

async function getServer(): Promise<ApolloServer<GraphQLContext>> {
  if (!serverPromise) {
    serverPromise = initServer();
  }
  return serverPromise;
}

async function initServer(): Promise<ApolloServer<GraphQLContext>> {
  const { ApolloServer } = await import("@apollo/server");
  const { createSchema } = await import("@kk/api");
  const schema = createSchema();
  const server = new ApolloServer<GraphQLContext>({ schema });
  await server.start();
  return server;
}

/**
 * Hono handler that adapts incoming Fetch-API requests to Apollo's
 * transport-agnostic `executeHTTPGraphQLRequest`. GraphQL stack is loaded
 * on first use so /healthz and other routes avoid Bun ESM init ordering
 * issues at cold start.
 */
export async function graphqlHandler(c: Context): Promise<Response> {
  const { HeaderMap } = await import("@apollo/server");
  const server = await getServer();
  const req = c.req.raw;

  const headerMap = new HeaderMap();
  req.headers.forEach((value, key) => {
    headerMap.set(key.toLowerCase(), value);
  });

  const url = new URL(req.url);

  let body: unknown;
  if (req.method === "POST") {
    try {
      body = await req.json();
    } catch {
      return c.json({ errors: [{ message: "Invalid JSON body" }] }, 400);
    }
  }

  const user = await resolveUser(req);

  const httpRes = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: {
      method: req.method,
      headers: headerMap,
      search: url.search,
      body,
    },
    context: async () => ({ user }),
  });

  const responseHeaders = new Headers();
  httpRes.headers.forEach((value, key) => {
    responseHeaders.set(key, value);
  });

  if (httpRes.body.kind === "complete") {
    return new Response(httpRes.body.string, {
      status: httpRes.status ?? 200,
      headers: responseHeaders,
    });
  }

  const iterator = httpRes.body.asyncIterator;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
        return;
      }
      controller.enqueue(new TextEncoder().encode(value));
    },
    async cancel() {
      await iterator.return?.();
    },
  });

  return new Response(stream, {
    status: httpRes.status ?? 200,
    headers: responseHeaders,
  });
}
