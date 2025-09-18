import type { GraphQLContext } from "@/lib/graphql/context";
import type { NextRequest } from "next/server";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { auth } from "@/auth";
import builder from "@/lib/graphql/schema-builder";

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
