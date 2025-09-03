import "reflect-metadata";
import type { GraphQLContext } from "@/lib/graphql/context";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { DateTimeISOResolver } from "graphql-scalars";
import { Allergen } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import RelayPlugin from "@pothos/plugin-relay";

const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
  };
  AuthScopes: {
    public: boolean;
    withAuthor: boolean;
  };
  Context: GraphQLContext;
}>({
  plugins: [RelayPlugin, ScopeAuthPlugin, PrismaPlugin],
  relay: {},
  scopeAuth: {
    authScopes: (context: GraphQLContext) => ({
      public: true,
      withAuthor: !!context.user,
    }),
  },
  prisma: {
    client: prisma,
    onUnusedQuery: "warn",
  },
});

builder.enumType(Allergen, { name: "Allergen" });

builder.addScalarType("Date", DateTimeISOResolver);

builder.queryType({
  fields: (t) => ({
    recipes: t.prismaConnection({
      type: "Recipe",
      cursor: "id",
      authScopes: { public: true },
      nullable: false,
      edgesNullable: false,
      nodeNullable: false,
      resolve: (query) => prisma.recipe.findMany({ ...query }),
    }),
    categories: t.prismaConnection({
      type: "Category",
      cursor: "id",
      authScopes: { public: true },
      nullable: false,
      edgesNullable: false,
      nodeNullable: false,
      resolve: (query) => prisma.category.findMany({ ...query }),
    }),
    myRecipes: t.prismaConnection({
      type: "Recipe",
      cursor: "id",
      authScopes: { withAuthor: true },
      nullable: false,
      edgesNullable: false,
      nodeNullable: false,
      resolve: (query, _parent, _args, context) =>
        prisma.recipe.findMany({
          ...query,
          where: { authorId: context.user!.id },
        }),
    }),
    recipe: t.prismaField({
      type: "Recipe",
      authScopes: { public: true },
      args: { id: t.arg.id({ required: true }) },
      resolve: (query, _parent, args) =>
        prisma.recipe.findUnique({ ...query, where: { id: args.id } }),
    }),
    searchRecipes: t.prismaConnection({
      type: "Recipe",
      cursor: "id",
      authScopes: { public: true },
      args: { query: t.arg.string({ required: true }) },
      resolve: (query, _parent, args) =>
        prisma.recipe.findMany({
          ...query,
          where: {
            OR: [
              { title: { contains: args.query, mode: "insensitive" } },
              { description: { contains: args.query, mode: "insensitive" } },
            ],
          },
        }),
    }),
  }),
});

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
    allergens: t.exposeStringList("allergens"),
    author: t.relation("author"),
    image: t.relation("image"),
    category: t.relation("category"),
    prepTime: t.exposeString("prepTime"),
    cookTime: t.exposeString("cookTime"),
  }),
});

builder.prismaNode("Image", {
  id: { field: "id" },
  fields: (t) => ({
    original: t.exposeString("original"),
    optimized: t.exposeString("optimized"),
    small: t.exposeString("small"),
    medium: t.exposeString("medium"),
    large: t.exposeString("large"),
    recipe: t.relation("recipe"),
  }),
});

builder.prismaNode("Ingredient", {
  id: { field: "id" },
  fields: (t) => ({
    name: t.exposeString("name", { nullable: false }),
    amount: t.exposeString("amount", { nullable: false }),
    unit: t.exposeString("unit", { nullable: false }),
  }),
});

builder.prismaNode("User", {
  id: { field: "id" },
  fields: (t) => ({
    name: t.exposeString("name"),
    rawId: t.exposeID("id", {
      description: "Raw database ID",
      nullable: false,
    }),
  }),
});

builder.prismaNode("Category", {
  id: { field: "id" },
  fields: (t) => ({
    name: t.exposeString("name", { nullable: false }),
    rawId: t.exposeID("id", {
      description: "Raw database ID",
      nullable: false,
    }),
  }),
});

const schema = builder.toSchema();

// Create Apollo Server
const server = new ApolloServer<GraphQLContext>({
  schema,
});

// Create and export the API route handler
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (_) => {
    const session = await auth();
    return {
      user: session?.user
        ? {
            id: session.user.id as string,
            email: session.user.email,
            name: session.user.name,
          }
        : null,
    };
  },
});

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}
