"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import type { RecipeConnection, RecipeDTO } from "@kk/shared";

import RecipeSkeletonList from "./recipe-skeleton-list";
import { RecipeCard } from "./recipe-card";

function RecipeLink({ recipe }: { recipe: RecipeDTO }) {
  return (
    <Link href={`/recipe/${recipe.id}`}>
      <RecipeCard recipe={recipe} />
    </Link>
  );
}

type RecipeInfiniteQueryResult = Pick<
  UseInfiniteQueryResult<InfiniteData<RecipeConnection>>,
  "data" | "fetchNextPage" | "hasNextPage" | "isFetchingNextPage" | "isLoading"
>;

interface RecipeListShellProps extends RecipeInfiniteQueryResult {
  emptyState?: React.ReactElement;
}

export function RecipeListShell({
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  emptyState,
}: Readonly<RecipeListShellProps>) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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
