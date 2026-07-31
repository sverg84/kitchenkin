import "server-only";

import type { RecipeConnection } from "@kk/shared";
import { prisma, type Prisma } from "@kk/db";

import {
  decodeRecipeCursor,
  encodeRecipeCursor,
} from "./cursor";
import {
  mapRecipeToDto,
  recipeSelectWithViewer,
  type RecipeDetailWithFavorite,
} from "./recipe-select";

type RecipePageRecord = RecipeDetailWithFavorite & { createdAt: Date };

function recipeSearchWhere(
  search?: string | null,
): Prisma.RecipeWhereInput | undefined {
  if (!search) return undefined;
  return {
    OR: [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ],
  };
}

function buildRecipeConnection(
  recipes: RecipePageRecord[],
  take: number,
  after: string | null | undefined,
  options?: { forceFavorited?: boolean },
): RecipeConnection {
  const hasPreviousPage = Boolean(after);
  const hasNextPage = recipes.length > take;
  const slicedRecipes = hasNextPage ? recipes.slice(0, take) : recipes;

  const startCursor = slicedRecipes[0]
    ? encodeRecipeCursor({
        createdAt: slicedRecipes[0].createdAt.toISOString(),
        id: slicedRecipes[0].id,
      })
    : null;
  const endCursor = slicedRecipes[slicedRecipes.length - 1]
    ? encodeRecipeCursor({
        createdAt:
          slicedRecipes[slicedRecipes.length - 1].createdAt.toISOString(),
        id: slicedRecipes[slicedRecipes.length - 1].id,
      })
    : null;

  return {
    exists: after ? true : slicedRecipes.length > 0,
    pageInfo: {
      hasPreviousPage,
      hasNextPage,
      startCursor,
      endCursor,
    },
    edges: slicedRecipes.map((recipe) => ({
      cursor: encodeRecipeCursor({
        createdAt: recipe.createdAt.toISOString(),
        id: recipe.id,
      }),
      node: mapRecipeToDto(recipe, {
        isFavorited: options?.forceFavorited ? true : undefined,
      }),
    })),
  };
}

async function fetchRecipePage(
  where: Prisma.RecipeWhereInput | undefined,
  {
    first,
    after,
    viewerUserId,
  }: {
    first: number;
    after?: string | null;
    viewerUserId?: string | null;
  },
): Promise<RecipePageRecord[]> {
  const take = first;
  const baseWhere = where;
  const afterCursor = after ? decodeRecipeCursor(after) : null;

  const combinedWhere: Prisma.RecipeWhereInput | undefined = afterCursor
    ? {
        AND: [
          ...(baseWhere ? [baseWhere] : []),
          {
            OR: [
              { createdAt: { lt: new Date(afterCursor.createdAt) } },
              {
                AND: [
                  { createdAt: { equals: new Date(afterCursor.createdAt) } },
                  { id: { lt: afterCursor.id } },
                ],
              },
            ],
          },
        ],
      }
    : baseWhere;

  return prisma.recipe.findMany({
    take: take + 1,
    where: combinedWhere,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      ...recipeSelectWithViewer(viewerUserId),
      createdAt: true,
    },
  }) as Promise<RecipePageRecord[]>;
}

export async function listRecipes({
  first = 24,
  after,
  search,
  viewerUserId,
}: {
  first?: number;
  after?: string | null;
  search?: string | null;
  viewerUserId?: string | null;
}): Promise<RecipeConnection> {
  const recipes = await fetchRecipePage(recipeSearchWhere(search), {
    first,
    after,
    viewerUserId,
  });
  return buildRecipeConnection(recipes, first, after);
}

export async function listMyRecipes(
  userId: string,
  {
    first = 24,
    after,
  }: { first?: number; after?: string | null },
): Promise<RecipeConnection> {
  const recipes = await fetchRecipePage(
    { authorId: userId },
    { first, after, viewerUserId: userId },
  );
  return buildRecipeConnection(recipes, first, after);
}

export async function listFavoriteRecipes(
  userId: string,
  { first = 24, after }: { first?: number; after?: string | null },
): Promise<RecipeConnection> {
  const recipes = await fetchRecipePage(
    { favoritedBy: { some: { id: userId } } },
    { first, after, viewerUserId: userId },
  );
  return buildRecipeConnection(recipes, first, after, { forceFavorited: true });
}

export { fetchRecipePage, recipeSearchWhere };
export {
  decodeRecipeCursor,
  encodeRecipeCursor,
} from "./cursor";
