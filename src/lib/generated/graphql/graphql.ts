/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  Date: { input: any; output: any; }
};

export enum Allergen {
  Dairy = 'Dairy',
  Eggs = 'Eggs',
  Fish = 'Fish',
  Peanuts = 'Peanuts',
  Sesame = 'Sesame',
  Shellfish = 'Shellfish',
  Soy = 'Soy',
  TreeNuts = 'TreeNuts',
  Wheat = 'Wheat'
}

export type Category = Node & {
  __typename?: 'Category';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  /** Raw database ID */
  rawId: Scalars['ID']['output'];
};

export type Image = Node & {
  __typename?: 'Image';
  id: Scalars['ID']['output'];
  large?: Maybe<Scalars['String']['output']>;
  medium?: Maybe<Scalars['String']['output']>;
  optimized?: Maybe<Scalars['String']['output']>;
  original?: Maybe<Scalars['String']['output']>;
  recipe?: Maybe<Recipe>;
  small?: Maybe<Scalars['String']['output']>;
};

export type Ingredient = Node & {
  __typename?: 'Ingredient';
  amount: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  unit: Scalars['String']['output'];
};

export type Node = {
  id: Scalars['ID']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  categories: QueryCategoriesConnection;
  myRecipes: QueryMyRecipesConnection;
  node?: Maybe<Node>;
  nodes: Array<Maybe<Node>>;
  recipe?: Maybe<Recipe>;
  recipes: QueryRecipesConnection;
  searchRecipes?: Maybe<QuerySearchRecipesConnection>;
};


export type QueryCategoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyRecipesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryNodesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type QueryRecipeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRecipesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySearchRecipesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};

export type QueryCategoriesConnection = {
  __typename?: 'QueryCategoriesConnection';
  edges: Array<QueryCategoriesConnectionEdge>;
  pageInfo: PageInfo;
};

export type QueryCategoriesConnectionEdge = {
  __typename?: 'QueryCategoriesConnectionEdge';
  cursor: Scalars['String']['output'];
  node: Category;
};

export type QueryMyRecipesConnection = {
  __typename?: 'QueryMyRecipesConnection';
  edges: Array<QueryMyRecipesConnectionEdge>;
  pageInfo: PageInfo;
};

export type QueryMyRecipesConnectionEdge = {
  __typename?: 'QueryMyRecipesConnectionEdge';
  cursor: Scalars['String']['output'];
  node: Recipe;
};

export type QueryRecipesConnection = {
  __typename?: 'QueryRecipesConnection';
  edges: Array<QueryRecipesConnectionEdge>;
  pageInfo: PageInfo;
};

export type QueryRecipesConnectionEdge = {
  __typename?: 'QueryRecipesConnectionEdge';
  cursor: Scalars['String']['output'];
  node: Recipe;
};

export type QuerySearchRecipesConnection = {
  __typename?: 'QuerySearchRecipesConnection';
  edges?: Maybe<Array<Maybe<QuerySearchRecipesConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QuerySearchRecipesConnectionEdge = {
  __typename?: 'QuerySearchRecipesConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Recipe>;
};

export type Recipe = Node & {
  __typename?: 'Recipe';
  allergens?: Maybe<Array<Scalars['String']['output']>>;
  author?: Maybe<User>;
  category?: Maybe<Category>;
  cookTime?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Image>;
  ingredients?: Maybe<Array<Ingredient>>;
  instructions?: Maybe<Array<Scalars['String']['output']>>;
  prepTime?: Maybe<Scalars['String']['output']>;
  /** Raw database ID */
  rawId: Scalars['ID']['output'];
  servings?: Maybe<Scalars['Int']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type User = Node & {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /** Raw database ID */
  rawId: Scalars['ID']['output'];
};

export type GqlRecipe_CommonDetailsFragment = { __typename?: 'Recipe', rawId: string, title?: string | null, description?: string | null, prepTime?: string | null, cookTime?: string | null, category?: { __typename?: 'Category', rawId: string, name: string } | null, image?: { __typename?: 'Image', optimized?: string | null, small?: string | null, medium?: string | null, large?: string | null } | null } & { ' $fragmentName'?: 'GqlRecipe_CommonDetailsFragment' };

export type GetRecipesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRecipesQuery = { __typename?: 'Query', recipes: { __typename?: 'QueryRecipesConnection', edges: Array<{ __typename?: 'QueryRecipesConnectionEdge', node: { __typename?: 'Recipe', id: string, title?: string | null, description?: string | null, prepTime?: string | null, cookTime?: string | null, category?: { __typename?: 'Category', name: string } | null } }> } };

export type SearchRecipesQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;


export type SearchRecipesQuery = { __typename?: 'Query', searchRecipes?: { __typename?: 'QuerySearchRecipesConnection', edges?: Array<{ __typename?: 'QuerySearchRecipesConnectionEdge', node?: { __typename?: 'Recipe', id: string, title?: string | null, description?: string | null, prepTime?: string | null, cookTime?: string | null, category?: { __typename?: 'Category', name: string } | null } | null } | null> | null } | null };

export type GetRecipesServerQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRecipesServerQuery = { __typename?: 'Query', recipes: { __typename: 'QueryRecipesConnection' } };

export type GetRecipeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetRecipeQuery = { __typename?: 'Query', recipe?: (
    { __typename?: 'Recipe', allergens?: Array<string> | null, servings?: number | null, instructions?: Array<string> | null, author?: { __typename?: 'User', rawId: string, name?: string | null } | null, ingredients?: Array<{ __typename?: 'Ingredient', id: string, name: string, amount: string, unit: string }> | null }
    & { ' $fragmentRefs'?: { 'GqlRecipe_CommonDetailsFragment': GqlRecipe_CommonDetailsFragment } }
  ) | null };

export type GetMyRecipesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyRecipesQuery = { __typename?: 'Query', myRecipes: { __typename?: 'QueryMyRecipesConnection', edges: Array<{ __typename?: 'QueryMyRecipesConnectionEdge', node: (
        { __typename?: 'Recipe' }
        & { ' $fragmentRefs'?: { 'GqlRecipe_CommonDetailsFragment': GqlRecipe_CommonDetailsFragment } }
      ) }> } };

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { __typename?: 'Query', categories: { __typename?: 'QueryCategoriesConnection', edges: Array<{ __typename?: 'QueryCategoriesConnectionEdge', node: { __typename?: 'Category', rawId: string, name: string } }> } };

export const GqlRecipe_CommonDetailsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GqlRecipe_commonDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Recipe"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rawId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"prepTime"}},{"kind":"Field","name":{"kind":"Name","value":"cookTime"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rawId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"optimized"}},{"kind":"Field","name":{"kind":"Name","value":"small"}},{"kind":"Field","name":{"kind":"Name","value":"medium"}},{"kind":"Field","name":{"kind":"Name","value":"large"}}]}}]}}]} as unknown as DocumentNode<GqlRecipe_CommonDetailsFragment, unknown>;
export const GetRecipesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRecipes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recipes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"prepTime"}},{"kind":"Field","name":{"kind":"Name","value":"cookTime"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetRecipesQuery, GetRecipesQueryVariables>;
export const SearchRecipesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchRecipes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchRecipes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"prepTime"}},{"kind":"Field","name":{"kind":"Name","value":"cookTime"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SearchRecipesQuery, SearchRecipesQueryVariables>;
export const GetRecipesServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRecipesServer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recipes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}}]}}]}}]} as unknown as DocumentNode<GetRecipesServerQuery, GetRecipesServerQueryVariables>;
export const GetRecipeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRecipe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recipe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GqlRecipe_commonDetails"}},{"kind":"Field","name":{"kind":"Name","value":"allergens"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rawId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"servings"}},{"kind":"Field","name":{"kind":"Name","value":"ingredients"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"instructions"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GqlRecipe_commonDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Recipe"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rawId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"prepTime"}},{"kind":"Field","name":{"kind":"Name","value":"cookTime"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rawId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"optimized"}},{"kind":"Field","name":{"kind":"Name","value":"small"}},{"kind":"Field","name":{"kind":"Name","value":"medium"}},{"kind":"Field","name":{"kind":"Name","value":"large"}}]}}]}}]} as unknown as DocumentNode<GetRecipeQuery, GetRecipeQueryVariables>;
export const GetMyRecipesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyRecipes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myRecipes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GqlRecipe_commonDetails"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GqlRecipe_commonDetails"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Recipe"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rawId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"prepTime"}},{"kind":"Field","name":{"kind":"Name","value":"cookTime"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rawId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"optimized"}},{"kind":"Field","name":{"kind":"Name","value":"small"}},{"kind":"Field","name":{"kind":"Name","value":"medium"}},{"kind":"Field","name":{"kind":"Name","value":"large"}}]}}]}}]} as unknown as DocumentNode<GetMyRecipesQuery, GetMyRecipesQueryVariables>;
export const GetCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rawId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetCategoriesQuery, GetCategoriesQueryVariables>;