import { prisma } from "@/lib/prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import type { GraphQLContext } from "../context";
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import RelayPlugin from "@pothos/plugin-relay";
import { DateTimeISOResolver } from "graphql-scalars";
import { Allergen } from "@prisma/client";
import type {
  PageInfo,
  QueryRecipesConnection,
  QueryRecipesConnectionEdge,
} from "@/graphql";

const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
  };
  Interfaces: {
    IRecipeConnection: QueryRecipesConnection;
    IRecipeConnectionEdge: QueryRecipesConnectionEdge;
  };
  AuthScopes: {
    public: boolean;
    withAuthor: boolean;
  };
  Context: GraphQLContext;
  PageInfo: PageInfo;
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

builder.queryType({});

export default builder;
