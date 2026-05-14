import { Allergen, Prisma } from "@kk/db";
import { prismaSelectFromResolveInfo } from "../graphql-resolve";
import { prisma } from "@kk/db";
import builder from "./builder";

type RecipeCursorPayload = {
  createdAt: string;
  id: string;
};

function encodeRecipeCursor(payload: RecipeCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeRecipeCursor(cursor: string): RecipeCursorPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    throw new Error("Invalid cursor");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as Record<string, unknown>).createdAt !== "string" ||
    typeof (parsed as Record<string, unknown>).id !== "string"
  ) {
    throw new Error("Invalid cursor");
  }

  return parsed as RecipeCursorPayload;
}

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

builder.prismaNode("Recipe", {
  id: { field: "id" },
  fields: (t) => ({
    rawId: t.exposeID("id", {
      description: "Raw database ID",
      nullable: false,
    }),
    title: t.exposeString("title"),
    description: t.exposeString("description"),
    servings: t.exposeInt("servings"),
    instructions: t.exposeStringList("instructions"),
    ingredients: t.relation("ingredients"),
    allergens: t.expose("allergens", { type: [Allergen], nullable: false }),
    author: t.relation("author"),
    image: t.relation("image"),
    category: t.relation("category"),
    prepTime: t.exposeString("prepTime"),
    cookTime: t.exposeString("cookTime"),
  }),
});

const IRecipeConnectionEdge = builder.interfaceType("IRecipeConnectionEdge", {
  resolveType: (value) => {
    return value.__typename;
  },
  fields: (t) => ({
    // @ts-expect-error TS2322: Recipe type exists in GraphQL schema, but TS doesn't recognize it.
    node: t.field({ type: "Recipe", nullable: false }),
  }),
});

const IRecipeConnection = builder.interfaceType("IRecipeConnection", {
  resolveType: (value) => {
    return value.__typename;
  },
  fields: (t) => ({
    id: t.id({ nullable: false }),
    exists: t.boolean({ nullable: false }),
    // @ts-expect-error TS2322: PageInfo type exists in GraphQL schema, but TS doesn't recognize it.
    pageInfo: t.field({ type: "PageInfo", nullable: false }),
    edges: t.field({ type: [IRecipeConnectionEdge], nullable: false }),
  }),
});

builder.queryFields((t) => ({
  recipes: t.connection(
    {
      // @ts-expect-error TS2322: Recipe type exists in GraphQL schema, but TS doesn't recognize it.
      type: "Recipe",
      nullable: false,
      authScopes: { public: true },
      interfaces: [IRecipeConnection],
      nodeNullable: false,
      edgesNullable: false,
      args: {
        first: t.arg.int({ required: false, defaultValue: 24 }),
        after: t.arg.string({ required: false }),
        search: t.arg.string({ required: false }),
      },
      resolve: async (_parent, { first, after, search }) => {
        const take = first ?? 24;

        const baseWhere = recipeSearchWhere(search);
        const afterCursor = after ? decodeRecipeCursor(after) : null;

        const where: Prisma.RecipeWhereInput | undefined = afterCursor
          ? {
              AND: [
                ...(baseWhere ? [baseWhere] : []),
                {
                  OR: [
                    { createdAt: { lt: new Date(afterCursor.createdAt) } },
                    {
                      AND: [
                        {
                          createdAt: {
                            equals: new Date(afterCursor.createdAt),
                          },
                        },
                        { id: { lt: afterCursor.id } },
                      ],
                    },
                  ],
                },
              ],
            }
          : baseWhere;

        const recipes = await prisma.recipe.findMany({
          take: take + 1,
          where,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });

        const hasPreviousPage = Boolean(after);
        const hasNextPage = recipes.length > take;
        const slicedRecipes = hasNextPage ? recipes.slice(0, take) : recipes;

        const startCursor: string | null = slicedRecipes[0]
          ? encodeRecipeCursor({
              createdAt: slicedRecipes[0].createdAt.toISOString(),
              id: slicedRecipes[0].id,
            })
          : null;
        const endCursor: string | null = slicedRecipes[slicedRecipes.length - 1]
          ? encodeRecipeCursor({
              createdAt:
                slicedRecipes[slicedRecipes.length - 1].createdAt.toISOString(),
              id: slicedRecipes[slicedRecipes.length - 1].id,
            })
          : null;

        return {
          __typename: "QueryRecipesConnection",
          exists: after ? true : slicedRecipes.length > 0,
          pageInfo: {
            __typename: "PageInfo",
            hasPreviousPage,
            hasNextPage,
            startCursor,
            endCursor,
          },
          edges: slicedRecipes.map((recipe) => ({
            __typename: "QueryRecipesConnectionEdge",
            cursor: encodeRecipeCursor({
              createdAt: recipe.createdAt.toISOString(),
              id: recipe.id,
            }),
            node: recipe,
          })),
          args: { search },
        };
      },
    },
    {
      interfaces: [IRecipeConnection],
      fields: (tc) => ({
        id: tc.id({
          nullable: false,
          resolve: () => "RecipesConnection",
        }),
        exists: tc.boolean({
          args: { search: tc.arg.string({ required: false }) },
          nullable: false,
          resolve: (parent) => Boolean((parent as { exists?: boolean }).exists),
        }),
      }),
    },
    { interfaces: [IRecipeConnectionEdge] },
  ),
  myRecipes: t.prismaConnection(
    {
      type: "Recipe",
      cursor: "id",
      authScopes: { withAuthor: true },
      nullable: false,
      edgesNullable: false,
      nodeNullable: false,
      resolve: (query, _parent, _args, context, info) => {
        const path: [string, string][] = [
          ["QueryMyRecipesConnection", "edges"],
          ["QueryMyRecipesConnectionEdge", "node"],
        ];

        const select: Prisma.RecipeSelect = prismaSelectFromResolveInfo(
          info,
          path,
          "Recipe",
        );

        const { include: _include, ...rest } = query;

        return prisma.recipe.findMany({
          ...rest,
          select,
          where: { authorId: context.user!.id },
        });
      },
    },
    {
      // @ts-expect-error TS2322: Prisma connection returns Recipe[], but we add id/exists fields via fields()
      interfaces: [IRecipeConnection],
      fields: (tc) => ({
        id: tc.id({
          nullable: false,
          resolve: (_parent, _args, context) =>
            `MyRecipesConnection:${context.user!.id}`,
        }),
        exists: tc.boolean({
          nullable: false,
          resolve: async (_parent, _args, context) => {
            const exists = await prisma.recipe.findFirst({
              select: { id: true },
              take: 1,
              where: { authorId: context.user!.id },
            });
            return Boolean(exists);
          },
        }),
      }),
    },
    { interfaces: [IRecipeConnectionEdge] },
  ),
  favoriteRecipes: t.prismaConnection(
    {
      type: "Recipe",
      cursor: "id",
      authScopes: { withAuthor: true },
      nullable: false,
      edgesNullable: false,
      nodeNullable: false,
      resolve: async (query, _parent, _args, context, info) => {
        const path: [string, string][] = [
          ["QueryFavoriteRecipesConnection", "edges"],
          ["QueryFavoriteRecipesConnectionEdge", "node"],
        ];

        const select: Prisma.RecipeSelect = prismaSelectFromResolveInfo(
          info,
          path,
          "Recipe",
        );

        const { include: _include, ...rest } = query;

        return await prisma.recipe.findMany({
          ...rest,
          select,
          where: { favoritedBy: { some: { id: context.user!.id } } },
        });
      },
    },
    {
      // @ts-expect-error TS2322: Prisma connection returns Recipe[], but we add id/exists fields via fields()
      interfaces: [IRecipeConnection],
      fields: (tc) => ({
        id: tc.id({
          nullable: false,
          resolve: (_parent, _args, context) =>
            `FavoriteRecipesConnection:${context.user!.id}`,
        }),
        exists: tc.boolean({
          nullable: false,
          resolve: async (_parent, _args, context) => {
            const exists = await prisma.recipe.findFirst({
              select: { id: true },
              take: 1,
              where: { favoritedBy: { some: { id: context.user!.id } } },
            });
            return Boolean(exists);
          },
        }),
      }),
    },
    { interfaces: [IRecipeConnectionEdge] },
  ),
  recipe: t.prismaField({
    type: "Recipe",
    authScopes: { public: true },
    args: { id: t.arg.id({ required: true }) },
    resolve: (query, _parent, args, _context, info) => {
      const select: Prisma.RecipeSelect = prismaSelectFromResolveInfo(
        info,
        [],
        "Recipe",
      );

      const { include: _include, ...rest } = query;

      return prisma.recipe.findUnique({
        ...rest,
        select,
        where: { id: args.id },
      });
    },
  }),
}));
