"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  queryKeys,
  type RecipeConnection,
  webApiClient,
} from "@kk/shared";

export function useRecipes(search?: string | null) {
  return useInfiniteQuery({
    queryKey: queryKeys.recipes.list({ search: search ?? null }),
    queryFn: async ({ pageParam }) => {
      return webApiClient.get<RecipeConnection>("/api/recipes", {
        searchParams: {
          first: 24,
          after: pageParam ?? undefined,
          search: search ?? undefined,
        },
      });
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
  });
}

export function useMyRecipes() {
  return useInfiniteQuery({
    queryKey: queryKeys.recipes.mine(),
    queryFn: async ({ pageParam }) => {
      return webApiClient.get<RecipeConnection>("/api/recipes/mine", {
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

export function useFavoriteRecipes() {
  return useInfiniteQuery({
    queryKey: queryKeys.recipes.favorites(),
    queryFn: async ({ pageParam }) => {
      return webApiClient.get<RecipeConnection>("/api/recipes/favorites", {
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
