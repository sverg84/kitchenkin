"use client";

import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  queryKeys,
  type RecipeConnection,
  type SetFavoriteResponse,
  webApiClient,
} from "@kk/shared";

import { publishFavoriteChange } from "@/lib/query/favorite-sync";

function patchRecipeFavoritedInCaches(
  queryClient: QueryClient,
  recipeId: string,
  favorited: boolean,
): void {
  queryClient.setQueriesData<InfiniteData<RecipeConnection>>(
    { queryKey: queryKeys.recipes.all },
    (data) => {
      if (!data?.pages) return data;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          edges: page.edges.map((edge) =>
            edge.node.id === recipeId
              ? { ...edge, node: { ...edge.node, isFavorited: favorited } }
              : edge,
          ),
        })),
      };
    },
  );
}

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

export function useSetFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      favorited,
    }: {
      recipeId: string;
      favorited: boolean;
    }) => {
      return webApiClient.post<SetFavoriteResponse>(
        `/api/recipes/${recipeId}/favorite`,
        { body: { favorited } },
      );
    },
    onMutate: async ({ recipeId, favorited }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.recipes.all });
      const previous = queryClient.getQueriesData<InfiniteData<RecipeConnection>>(
        { queryKey: queryKeys.recipes.all },
      );
      patchRecipeFavoritedInCaches(queryClient, recipeId, favorited);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (!context?.previous) return;
      for (const [queryKey, data] of context.previous) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSuccess: (result, { recipeId }) => {
      patchRecipeFavoritedInCaches(queryClient, recipeId, result.favorited);
      publishFavoriteChange({ recipeId, favorited: result.favorited });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.favorites(),
      });
    },
  });
}
