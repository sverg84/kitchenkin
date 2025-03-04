import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  OperationVariables,
  QueryOptions,
} from "@apollo/client";
import { unstable_cache } from "next/cache";

type AllowedPrimitive = number | string | boolean | null | undefined;
type AllowedData = Readonly<{
  [key: string]:
    | AllowedPrimitive
    | AllowedData
    | AllowedPrimitive[]
    | AllowedData[];
}>;

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI,
  fetch,
});

// TODO: Change this after 1st deployment
export function getClient() {
  return process.env.NODE_ENV === "development"
    ? new ApolloClient({
        ssrMode: true,
        link: httpLink,
        cache: new InMemoryCache(),
      })
    : null;
}

export async function fetchGql<TData extends AllowedData>(
  { query, variables }: QueryOptions<OperationVariables, TData>,
  queryKey: string
): Promise<TData | undefined> {
  return unstable_cache(
    async () => {
      const client = getClient();
      const result = await client?.query<TData>({
        query,
        variables,
      });
      return result?.data;
    },
    [queryKey],
    { revalidate: 60 }
  )();
}
