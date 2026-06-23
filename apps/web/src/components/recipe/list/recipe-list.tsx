"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { RecipeDTO } from "@kk/shared";

import {
  useFavoriteRecipes,
  useMyRecipes,
  useRecipes,
} from "@/lib/query/hooks/use-recipes";
import { RecipeCard } from "./recipe-card";
import RecipeSkeletonList from "./recipe-skeleton-list";

type RecipeListVariant = "recipes" | "myRecipes" | "favorites";

interface RecipeListProps {
  variant: RecipeListVariant;
  emptyState?: React.ReactElement;
}

function RecipeLink({ recipe }: { recipe: RecipeDTO }) {
  return (
    <Link href={`/recipe/${recipe.id}`}>
      <RecipeCard recipe={recipe} />
    </Link>
  );
}

function useRecipeQuery(variant: RecipeListVariant, search: string | null) {
  const recipesQuery = useRecipes(search);
  const myRecipesQuery = useMyRecipes();
  const favoritesQuery = useFavoriteRecipes();

  if (variant === "myRecipes") return myRecipesQuery;
  if (variant === "favorites") return favoritesQuery;
  return recipesQuery;
}

export default function RecipeList({
  variant,
  emptyState,
}: Readonly<RecipeListProps>) {
  const searchParams = useSearchParams();
  const search = variant === "recipes" ? searchParams.get("search") : null;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useRecipeQuery(variant, search);

  const recipes =
    data?.pages.flatMap((page) => page.edges.map((edge) => edge.node)) ?? [];
  const exists = data?.pages[0]?.exists ?? false;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    const element = loadMoreRef.current;
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, loadMore]);

  if (isLoading) {
    return <RecipeSkeletonList />;
  }

  if (!exists) {
    return emptyState ?? null;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeLink key={recipe.id} recipe={recipe} />
        ))}
      </div>
      {isFetchingNextPage && <RecipeSkeletonList className="mt-6" />}
      <div ref={loadMoreRef} className="h-10" />
    </>
  );
}
