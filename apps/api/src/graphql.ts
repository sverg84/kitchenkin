import { ApolloServer, HeaderMap } from "@apollo/server";
import { schema, type GraphQLContext } from "@kk/api";
import type { Context } from "hono";

import { resolveUser } from "./context";

const server = new ApolloServer<GraphQLContext>({ schema });

// Apollo's executeHTTPGraphQLRequest requires the server to be started.
// Bun's top-level await is supported; this resolves once before the
// first request is served.
await server.start();

/**
 * Hono handler that adapts incoming Fetch-API requests to Apollo's
 * transport-agnostic `executeHTTPGraphQLRequest`. We do this directly
 * (rather than depending on a third-party `@as-integrations/hono`
 * adapter that may not exist) so we control the request/response
 * shape and avoid an extra dep.
 */
export async function graphqlHandler(c: Context): Promise<Response> {
  const req = c.req.raw;

  const headerMap = new HeaderMap();
  req.headers.forEach((value, key) => {
    headerMap.set(key.toLowerCase(), value);
  });

  const url = new URL(req.url);

  // For POST, parse JSON body (Apollo expects an already-parsed body).
  // For GET, the operation lives in the query string and body is null.
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

  // Chunked async-iterator response (e.g. @defer/@stream, future use).
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
