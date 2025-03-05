import type { AuthChecker } from "type-graphql"
import type { GraphQLContext } from "./context"

export const authChecker: AuthChecker<GraphQLContext> = ({ context }) => {
  return !!context.user
}

