import { registerApolloClient } from "@apollo/client-integration-nextjs";
import { makeClient } from "./apollo-client";
import { headers } from "next/headers";

export const { getClient, query, PreloadQuery } = registerApolloClient(
  async () => makeClient((await headers()).get("cookie"))
);
