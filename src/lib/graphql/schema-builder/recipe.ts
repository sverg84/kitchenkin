import { Allergen, Prisma } from "@prisma/client";
import { prismaSelectFromResolveInfo } from "@/lib/prisma/graphql-resolve";
import { prisma } from "@/lib/prisma";
import builder from "./builder";

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

builder.queryFields((t) => ({
  recipes: t.prismaConnection({
    type: "Recipe",
    cursor: "id",
    authScopes: { public: true },
    nullable: false,
    edgesNullable: false,
    nodeNullable: false,
    args: { search: t.arg.string({ required: false }) },
    resolve: (query, _parent, args, _context, info) => {
      const path: [string, string][] = [
        ["QueryRecipesConnection", "edges"],
        ["QueryRecipesConnectionEdge", "node"],
      ];

      const select: Prisma.RecipeSelect = prismaSelectFromResolveInfo(
        info,
        path,
        "Recipe"
      );

      const { include: _include, ...rest } = query;

      return prisma.recipe.findMany({
        select,
        ...rest,
        ...(args.search
          ? {
              where: {
                OR: [
                  { title: { contains: args.search, mode: "insensitive" } },
                  {
                    description: {
                      contains: args.search,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            }
          : {}),
      });
    },
  }),
  myRecipes: t.prismaConnection({
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
        "Recipe"
      );

      const { include: _include, ...rest } = query;

      return prisma.recipe.findMany({
        ...rest,
        select,
        where: { authorId: context.user!.id },
      });
    },
  }),
  recipe: t.prismaField({
    type: "Recipe",
    authScopes: { public: true },
    args: { id: t.arg.id({ required: true }) },
    resolve: (query, _parent, args, _context, info) => {
      const select: Prisma.RecipeSelect = prismaSelectFromResolveInfo(
        info,
        [],
        "Recipe"
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
