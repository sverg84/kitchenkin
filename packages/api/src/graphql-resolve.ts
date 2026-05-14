import type { GraphQLResolveInfo } from "graphql";
import { type ResolveTree, parseResolveInfo } from "graphql-parse-resolve-info";

function resolveTreeToPrismaSelect(tree: {
  [str: string]: ResolveTree;
}): Record<string, unknown> {
  const select: Record<string, unknown> = {};

  const fields = Object.keys(tree);
  if (fields.length === 0) {
    return select;
  }

  for (const key of fields) {
    if (key === "rawId") {
      select["id"] = true;
      continue;
    }

    const child = tree[key];

    if (!child.fieldsByTypeName) {
      select[key] = true;
      continue;
    }

    // Assume only one type for now
    const typeNames = Object.keys(child.fieldsByTypeName);
    if (typeNames.length !== 0) {
      const typeName = typeNames[0];
      const typeFields = child.fieldsByTypeName[typeName];
      select[key] = { select: resolveTreeToPrismaSelect(typeFields) };
    } else {
      select[key] = true;
    }
  }

  return select;
}

/**
 * Generates a Prisma select object from GraphQL resolve info.
 *
 * This function parses the GraphQLResolveInfo to extract the selection set,
 * traverses the specified path to reach the desired field, and then converts
 * the resolve tree for the target type into a Prisma select object.
 *
 * @param info - The GraphQL resolve info containing the query selection set.
 * @param path - An optional array of [typename, field] tuples to traverse nested fields.
 * @param destinationTypeName - The name of the GraphQL type to generate the select object for.
 * @returns A Prisma select object representing the fields requested for the destination type.
 *
 * @remarks
 * Returns an empty object if the resolve info cannot be parsed or the path is invalid.
 */
export function prismaSelectFromResolveInfo(
  info: GraphQLResolveInfo,
  path: [string, string][] = [],
  destinationTypeName: string,
): Record<string, unknown> {
  const parsed = parseResolveInfo(info);
  console.log("parsed", parsed);
  if (!parsed) {
    return {};
  }

  let targetTree: ResolveTree = parsed as ResolveTree;

  for (const [typename, field] of path) {
    if (Object.keys(targetTree.fieldsByTypeName).length > 0) {
      targetTree = targetTree.fieldsByTypeName[typename][field];
    }

    if (!targetTree) {
      return {};
    }
  }

  return resolveTreeToPrismaSelect(
    targetTree.fieldsByTypeName[destinationTypeName],
  );
}
