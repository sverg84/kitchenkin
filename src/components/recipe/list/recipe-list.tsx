"use client";

import type { OperationVariables } from "@apollo/client";
import { useQuery, useReadQuery } from "@apollo/client/react";
import type { TransportedQueryRef } from "@apollo/client-integration-nextjs";
import type { DocumentNode } from "graphql";
import { RECIPES_QUERY } from "@/lib/graphql/queries/get-recipes";
import { RECIPES_FOR_USER_QUERY } from "@/lib/graphql/queries/my-recipes";
import { FAVORITE_RECIPES_QUERY } from "@/lib/graphql/queries/favorite-recipes";
import InfiniteScrollList from "./infinite-scroll";
import type {
  FavoriteRecipesQuery,
  FavoriteRecipesQueryVariables,
  GetRecipesQuery,
  GetRecipesQueryVariables,
  RecipesForUserQueryQuery,
  RecipesForUserQueryQueryVariables,
} from "@/lib/generated/graphql/graphql";

const QUERIES = {
  recipes: RECIPES_QUERY,
  myRecipes: RECIPES_FOR_USER_QUERY,
  favorites: FAVORITE_RECIPES_QUERY,
};

type RecipeConnectionQuery = GetRecipesQuery | FavoriteRecipesQuery | RecipesForUserQueryQuery;
type RecipeConnectionQueryVariables =
  | GetRecipesQueryVariables
  | FavoriteRecipesQueryVariables
  | RecipesForUserQueryQueryVariables;

interface RecipeListCommonProps {
  query: keyof typeof QUERIES;
  variables?: OperationVariables;
  emptyState?: React.ReactElement;
}

interface RecipeListPreloadedProps extends RecipeListCommonProps {
  queryRef: TransportedQueryRef<RecipeConnectionQuery, RecipeConnectionQueryVariables>;
}

interface RecipeListLiveProps extends RecipeListCommonProps {
  queryRef?: undefined;
}

function PreloadedRecipeList({
  query,
  variables,
  emptyState,
  queryRef,
}: Readonly<RecipeListPreloadedProps>) {
  const { data } = useReadQuery(queryRef);
  const recipes = data?.recipes;

  if (!recipes?.exists) {
    return emptyState;
  }

  return (
    <InfiniteScrollList
      query={QUERIES[query]}
      variables={variables}
      connection={recipes}
    />
  );
}

function LiveRecipeList({
  query,
  variables,
  emptyState,
}: Readonly<RecipeListLiveProps>) {
  const effectiveVariables = variables ?? { first: 24 };
  const { data } = useQuery(QUERIES[query] as DocumentNode, {
    variables: effectiveVariables,
  });
  const recipes = (data as RecipeConnectionQuery | undefined)?.recipes;

  if (!recipes?.exists) {
    return emptyState;
  }

  return (
    <InfiniteScrollList
      query={QUERIES[query]}
      variables={effectiveVariables}
      connection={recipes}
    />
  );
}

export type RecipeListProps = RecipeListPreloadedProps | RecipeListLiveProps;

export default function RecipeList(props: Readonly<RecipeListProps>) {
  if ("queryRef" in props && props.queryRef) {
    return <PreloadedRecipeList {...props} />;
  }
  return <LiveRecipeList {...props} />;
}
