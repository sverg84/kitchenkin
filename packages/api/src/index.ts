import "./schema";
import builder from "./schema/builder";

export const schema = builder.toSchema();
export { builder };
export type { GraphQLContext } from "./context";
