import { prisma } from "@/lib/prisma";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import type { GraphQLContext } from "../context";
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import RelayPlugin from "@pothos/plugin-relay";
import { DateTimeISOResolver } from "graphql-scalars";
import { Allergen } from "@prisma/client";

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

builder.queryType({});

export default builder;
