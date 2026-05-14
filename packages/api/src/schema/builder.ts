import { prisma } from "@kk/db";
import type PrismaTypes from "../generated/pothos-prisma";
import { getDatamodel } from "../generated/pothos-prisma";
import type { GraphQLContext } from "../context";
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import RelayPlugin from "@pothos/plugin-relay";
import { DateTimeISOResolver } from "graphql-scalars";
import { Allergen } from "@kk/db";

// Local stubs mirroring the GraphQL codegen output's shape so this package
// stays independent of @kk/graphql (Phase 4) and @kk/web. They only need to
// match Pothos' generic constraints; runtime values come straight from the
// resolvers defined in this package.
type PageInfo = {
  __typename?: "PageInfo";
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
};

interface IRecipeConnectionEdge {
  cursor: string;
  node: unknown;
}

interface IRecipeConnection {
  exists: boolean;
  id: string;
  pageInfo: PageInfo;
  edges: IRecipeConnectionEdge[];
}

type QueryRecipesConnectionEdge = IRecipeConnectionEdge & {
  __typename?: "QueryRecipesConnectionEdge";
};

type QueryRecipesConnection = IRecipeConnection & {
  __typename?: "QueryRecipesConnection";
  edges: QueryRecipesConnectionEdge[];
};

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
    dmmf: getDatamodel(),
    onUnusedQuery: "warn",
  },
});

builder.enumType(Allergen, { name: "Allergen" });

builder.addScalarType("Date", DateTimeISOResolver);

builder.queryType({});

export default builder;
