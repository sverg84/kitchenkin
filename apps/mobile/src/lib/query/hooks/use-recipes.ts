"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  queryKeys,
  type RecipeConnection,
} from "@kk/shared";

import { mobileApiClient } from "@/lib/api-client";

export function useRecipes() {
  return useInfiniteQuery({
    queryKey: queryKeys.recipes.list({ search: null }),
    queryFn: async ({ pageParam }) => {
      return mobileApiClient.get<RecipeConnection>("/recipes", {
        searchParams: {
          first: 24,
          after: pageParam ?? undefined,
        },
      });
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
  });
}
