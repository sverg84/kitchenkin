import { registerApolloClient } from "@apollo/client-integration-nextjs";
import { headers } from "next/headers";

import { makeClient } from "./apollo-client";

export const { getClient, query, PreloadQuery } = registerApolloClient(
  async () => {
    const h = await headers();
    const cookie = h.get("cookie") ?? "";
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto =
      (h.get("x-forwarded-proto") ?? "http").split(",")[0]?.trim() ?? "http";
    const appOrigin =
      host != null ? `${proto}://${host.split(",")[0]?.trim()}` : undefined;
    return makeClient(cookie, appOrigin);
  },
);
