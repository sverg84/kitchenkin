import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { RecipeResolver } from "@/lib/graphql/resolvers/recipe.resolver";
import { CategoryResolver } from "@/lib/graphql/resolvers/category.resolver";
import { auth } from "@/auth";
import type { GraphQLContext } from "@/lib/graphql/context";
import { authChecker } from "@/lib/graphql/auth-checker";
import { NextRequest } from "next/server";
import { GraphQLDateTimeISO } from "graphql-scalars";

// Build the TypeGraphQL schema
const schema = await buildSchema({
  resolvers: [RecipeResolver, CategoryResolver],
  authChecker,
  validate: true,
  emitSchemaFile: true,
  scalarsMap: [{ type: Date, scalar: GraphQLDateTimeISO }],
});

// Create Apollo Server
const server = new ApolloServer<GraphQLContext>({
  schema,
});

// Create and export the API route handler
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    const authorization = req.headers.get("Authorization");
    const token = authorization ? authorization.split(" ")[1] : null;

    if (token) {
      req.cookies.set("authjs.session-token", token);
    }

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
