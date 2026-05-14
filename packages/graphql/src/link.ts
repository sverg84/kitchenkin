import { ApolloLink } from "@apollo/client/link";
import { SetContextLink } from "@apollo/client/link/context";
import { HttpLink } from "@apollo/client/link/http";

export type GraphQLLinkOptions = {
  /**
   * Absolute URL of the GraphQL endpoint. Falls back to
   * `process.env.NEXT_PUBLIC_GRAPHQL_URI` when set (e.g. Next.js), otherwise
   * `http://localhost:4000/graphql` (standalone `apps/api` in local dev).
   */
  uri?: string;
  /**
   * Optional fixed headers (e.g., a forwarded cookie on web SSR or an
   * `Authorization: Bearer ...` token on mobile).
   */
  headers?: Record<string, string>;
  /**
   * Per-operation headers (e.g., mint a short-lived bearer). Merged after
   * {@link GraphQLLinkOptions.headers}. Runs on every GraphQL request.
   */
  getHeaders?:
    | (() => Record<string, string> | Promise<Record<string, string>>)
    | undefined;
  /**
   * Fetch credentials policy. Defaults to `"include"` so the web app's
   * NextAuth cookie travels with requests.
   */
  credentials?: RequestCredentials;
  /**
   * Custom fetch implementation. Required on React Native where the
   * default fetch is fine, but exposed for tests and edge runtimes.
   */
  fetch?: typeof fetch;
};

export function makeHttpLink(options: GraphQLLinkOptions = {}): ApolloLink {
  const uri =
    options.uri ??
    process.env.NEXT_PUBLIC_GRAPHQL_URI ??
    "http://localhost:4000/graphql";

  const credentials = options.credentials ?? "include";
  const { fetch: fetchImpl, getHeaders, headers: staticHeaders } = options;

  const httpLink = new HttpLink({
    uri,
    credentials,
    headers: getHeaders ? undefined : staticHeaders,
    fetch: fetchImpl,
  });

  if (!getHeaders) {
    return httpLink;
  }

  const contextLink = new SetContextLink(async () => ({
    headers: {
      ...(staticHeaders ?? {}),
      ...(await getHeaders()),
    },
  }));

  return ApolloLink.from([contextLink, httpLink]);
}
