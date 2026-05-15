import { NextResponse } from "next/server";

import { issueWebBearerPayloadOrNull } from "@/lib/auth/issue-web-bearer-from-session";

function upstreamGraphqlUrl(): string | null {
  const raw =
    process.env.GRAPHQL_UPSTREAM_URL ??
    process.env.GRAPHQL_PROXY_UPSTREAM_URL ??
    null;
  if (raw) return raw;
  if (process.env.NODE_ENV !== "production") {
    return (
      process.env.NEXT_PUBLIC_GRAPHQL_URI ?? "http://127.0.0.1:4000/graphql"
    );
  }
  return null;
}

function requestMayHaveSessionCookie(request: Request): boolean {
  const c = request.headers.get("cookie") ?? "";
  return (
    c.includes("authjs.session-token") ||
    c.includes("__Secure-authjs.session-token")
  );
}

function hopByHopHeader(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n === "connection" ||
    n === "keep-alive" ||
    n === "proxy-authenticate" ||
    n === "proxy-authorization" ||
    n === "te" ||
    n === "trailers" ||
    n === "transfer-encoding" ||
    n === "upgrade" ||
    n === "host" ||
    n === "content-length"
  );
}

async function proxyToUpstream(request: Request): Promise<Response> {
  const upstream = upstreamGraphqlUrl();
  if (!upstream) {
    return NextResponse.json(
      { errors: [{ message: "GraphQL proxy is not configured (GRAPHQL_UPSTREAM_URL)" }] },
      { status: 503 },
    );
  }

  const outHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (hopByHopHeader(key)) return;
    const lower = key.toLowerCase();
    if (lower === "cookie") return;
    outHeaders.set(key, value);
  });

  let authz = request.headers.get("authorization");
  if (!authz && requestMayHaveSessionCookie(request)) {
    try {
      const issued = await issueWebBearerPayloadOrNull();
      if (issued) authz = `Bearer ${issued.accessToken}`;
    } catch {
      /* Public GraphQL may proceed without a bearer if issuance fails. */
    }
  }
  if (authz) outHeaders.set("authorization", authz);

  const init: RequestInit = {
    method: request.method,
    headers: outHeaders,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstreamRes = await fetch(upstream, init);
  const resHeaders = new Headers(upstreamRes.headers);
  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: resHeaders,
  });
}

export async function GET(request: Request) {
  return proxyToUpstream(request);
}

export async function POST(request: Request) {
  return proxyToUpstream(request);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
    },
  });
}
