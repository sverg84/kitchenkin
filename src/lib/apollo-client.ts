import {
  ApolloClient,
  InMemoryCache,
  type NormalizedCacheObject,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { auth } from "@/auth";

let client: ApolloClient<NormalizedCacheObject> | undefined;

export async function getClient() {
  const session = await auth();

  // Create a new client if there isn't one or is running on the server
  if (!client || typeof window === "undefined") {
    const httpLink = createHttpLink({
      uri:
        process.env.NEXT_PUBLIC_GRAPHQL_URL ||
        "http://localhost:3000/api/graphql",
    });

    const authLink = setContext(async (_, { headers }) => {
      // Get the authentication token from the session
      const token = session?.user ? session : null;

      // Return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
        },
      };
    });

    client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
      ssrMode: typeof window === "undefined",
      defaultOptions: {
        query: {
          fetchPolicy: "no-cache",
          errorPolicy: "all",
        },
      },
    });
  }

  return client;
}
