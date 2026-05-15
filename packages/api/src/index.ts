import "./schema";
import builder from "./schema/builder";

export { builder };
export type { GraphQLContext } from "./context";

/** Build schema in the API process (after Apollo/`graphql` load) to avoid duplicate `graphql` copies. */
export function createSchema() {
  return builder.toSchema();
}
