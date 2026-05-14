"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useTransition } from "react";
import { RecipeCard } from "./recipe-card";
import RecipeSkeletonList from "./recipe-skeleton-list";
import { useApolloClient, useFragment } from "@apollo/client/react";
import type { DocumentNode } from "graphql";
import type { OperationVariables } from "@apollo/client";
import {
  PaginationFragment,
  RecipeConnectionFragment,
  type FavoriteRecipesQuery,
  type GetRecipesQuery,
  type PageInfo,
  type Recipe,
  type RecipesForUserQueryQuery,
} from "@kk/graphql";

type RecipeConnection =
  | GetRecipesQuery["recipes"]
  | FavoriteRecipesQuery["recipes"]
  | RecipesForUserQueryQuery["recipes"];

interface Props {
  query: DocumentNode;
  variables?: OperationVariables;
  connection: RecipeConnection;
}

function RecipeLink({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipe/${recipe.rawId}`}>
      <RecipeCard recipe={recipe} />
    </Link>
  );
}

export default function InfiniteScrollList({
  query,
  variables,
  connection,
}: Readonly<Props>) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const client = useApolloClient();
  const [loading, startTransition] = useTransition();

  const {
    data: { pageInfo },
  } = useFragment<{ pageInfo: PageInfo }>({
    fragment: PaginationFragment,
    fragmentName: "RecipeConnection_pagination",
    from: connection,
  });

  const {
    data: { edges },
  } = useFragment<{ edges: Array<{ node: Recipe }> }>({
    fragment: RecipeConnectionFragment,
    fragmentName: "RecipeConnection_connection",
    from: connection,
  });

  const loadMore = useCallback(() => {
    startTransition(async () => {
      await client.query({
        query,
        variables: { ...variables, after: pageInfo?.endCursor },
        fetchPolicy: "network-only",
      });
    });
  }, [client, pageInfo?.endCursor, query, variables]);

  useEffect(() => {
    if (!pageInfo?.hasNextPage || loading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    const element = loadMoreRef.current;

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [loadMore, loading, pageInfo?.hasNextPage]);

  const recipes = (edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is Recipe => Boolean(node));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeLink key={recipe?.rawId} recipe={recipe} />
        ))}
      </div>
      {loading && <RecipeSkeletonList className="mt-6" />}
      <div ref={loadMoreRef} className="h-10" />
    </>
  );
}
