/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment Recipe_commonDetails on Recipe {\n    rawId\n    title\n    description\n    prepTime\n    cookTime\n    category {\n      rawId\n      name\n    }\n    image {\n      src\n    }\n  }\n": typeof types.Recipe_CommonDetailsFragmentDoc,
    "\n  query GetRecipes($first: Int!, $search: String) {\n    recipes(first: $first, search: $search) {\n      edges {\n        node {\n          ...Recipe_commonDetails\n        }\n      }\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n": typeof types.GetRecipesDocument,
    "\n  query GetRecipe($id: ID!) {\n    recipe(id: $id) {\n      ...Recipe_commonDetails\n      allergens\n      author {\n        rawId\n        name\n      }\n      servings\n      ingredients {\n        id\n        name\n        amount\n        unit\n      }\n      instructions\n    }\n  }\n": typeof types.GetRecipeDocument,
    "\n  query GetMyRecipes {\n    myRecipes {\n      edges {\n        node {\n          ...Recipe_commonDetails\n        }\n      }\n    }\n  }\n": typeof types.GetMyRecipesDocument,
    "\n  query GetCategories {\n    categories {\n      edges {\n        node {\n          rawId\n          name\n        }\n      }\n    }\n  }\n": typeof types.GetCategoriesDocument,
};
const documents: Documents = {
    "\n  fragment Recipe_commonDetails on Recipe {\n    rawId\n    title\n    description\n    prepTime\n    cookTime\n    category {\n      rawId\n      name\n    }\n    image {\n      src\n    }\n  }\n": types.Recipe_CommonDetailsFragmentDoc,
    "\n  query GetRecipes($first: Int!, $search: String) {\n    recipes(first: $first, search: $search) {\n      edges {\n        node {\n          ...Recipe_commonDetails\n        }\n      }\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n": types.GetRecipesDocument,
    "\n  query GetRecipe($id: ID!) {\n    recipe(id: $id) {\n      ...Recipe_commonDetails\n      allergens\n      author {\n        rawId\n        name\n      }\n      servings\n      ingredients {\n        id\n        name\n        amount\n        unit\n      }\n      instructions\n    }\n  }\n": types.GetRecipeDocument,
    "\n  query GetMyRecipes {\n    myRecipes {\n      edges {\n        node {\n          ...Recipe_commonDetails\n        }\n      }\n    }\n  }\n": types.GetMyRecipesDocument,
    "\n  query GetCategories {\n    categories {\n      edges {\n        node {\n          rawId\n          name\n        }\n      }\n    }\n  }\n": types.GetCategoriesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment Recipe_commonDetails on Recipe {\n    rawId\n    title\n    description\n    prepTime\n    cookTime\n    category {\n      rawId\n      name\n    }\n    image {\n      src\n    }\n  }\n"): (typeof documents)["\n  fragment Recipe_commonDetails on Recipe {\n    rawId\n    title\n    description\n    prepTime\n    cookTime\n    category {\n      rawId\n      name\n    }\n    image {\n      src\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRecipes($first: Int!, $search: String) {\n    recipes(first: $first, search: $search) {\n      edges {\n        node {\n          ...Recipe_commonDetails\n        }\n      }\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetRecipes($first: Int!, $search: String) {\n    recipes(first: $first, search: $search) {\n      edges {\n        node {\n          ...Recipe_commonDetails\n        }\n      }\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRecipe($id: ID!) {\n    recipe(id: $id) {\n      ...Recipe_commonDetails\n      allergens\n      author {\n        rawId\n        name\n      }\n      servings\n      ingredients {\n        id\n        name\n        amount\n        unit\n      }\n      instructions\n    }\n  }\n"): (typeof documents)["\n  query GetRecipe($id: ID!) {\n    recipe(id: $id) {\n      ...Recipe_commonDetails\n      allergens\n      author {\n        rawId\n        name\n      }\n      servings\n      ingredients {\n        id\n        name\n        amount\n        unit\n      }\n      instructions\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMyRecipes {\n    myRecipes {\n      edges {\n        node {\n          ...Recipe_commonDetails\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMyRecipes {\n    myRecipes {\n      edges {\n        node {\n          ...Recipe_commonDetails\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCategories {\n    categories {\n      edges {\n        node {\n          rawId\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCategories {\n    categories {\n      edges {\n        node {\n          rawId\n          name\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;