"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  queryKeys,
  type RecipeConnection,
  type ToggleFavoriteResponse,
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

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      return webApiClient.post<ToggleFavoriteResponse>(
        `/api/recipes/${recipeId}/favorite`,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.favorites(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.all,
      });
    },
  });
}
