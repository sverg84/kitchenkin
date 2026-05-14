/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  Date: { input: any; output: any };
};

export enum Allergen {
  Dairy = "Dairy",
  Eggs = "Eggs",
  Fish = "Fish",
  Peanuts = "Peanuts",
  Sesame = "Sesame",
  Shellfish = "Shellfish",
  Soy = "Soy",
  TreeNuts = "TreeNuts",
  Wheat = "Wheat",
}

export type Category = Node & {
  __typename?: "Category";
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  /** Raw database ID */
  rawId: Scalars["ID"]["output"];
};

export type IRecipeConnection = {
  edges: Array<IRecipeConnectionEdge>;
  exists: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  pageInfo: PageInfo;
};

export type IRecipeConnectionEdge = {
  node: Recipe;
};

export type Image = Node & {
  __typename?: "Image";
  id: Scalars["ID"]["output"];
  recipe?: Maybe<Recipe>;
  src?: Maybe<Scalars["String"]["output"]>;
};

export type Ingredient = Node & {
  __typename?: "Ingredient";
  amount: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  unit: Scalars["String"]["output"];
};

export type Node = {
  id: Scalars["ID"]["output"];
};

export type PageInfo = {
  __typename?: "PageInfo";
  endCursor?: Maybe<Scalars["String"]["output"]>;
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  startCursor?: Maybe<Scalars["String"]["output"]>;
};

export type Query = {
  __typename?: "Query";
  categories: QueryCategoriesConnection;
  favoriteRecipes: QueryFavoriteRecipesConnection;
  myRecipes: QueryMyRecipesConnection;
  node?: Maybe<Node>;
  nodes: Array<Maybe<Node>>;
  recipe?: Maybe<Recipe>;
  recipes: QueryRecipesConnection;
};

export type QueryCategoriesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryFavoriteRecipesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryMyRecipesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryNodeArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryNodesArgs = {
  ids: Array<Scalars["ID"]["input"]>;
};

export type QueryRecipeArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryRecipesArgs = {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryCategoriesConnection = {
  __typename?: "QueryCategoriesConnection";
  edges: Array<QueryCategoriesConnectionEdge>;
  pageInfo: PageInfo;
};

export type QueryCategoriesConnectionEdge = {
  __typename?: "QueryCategoriesConnectionEdge";
  cursor: Scalars["String"]["output"];
  node: Category;
};

export type QueryFavoriteRecipesConnection = IRecipeConnection & {
  __typename?: "QueryFavoriteRecipesConnection";
  edges: Array<QueryFavoriteRecipesConnectionEdge>;
  exists: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  pageInfo: PageInfo;
};

export type QueryFavoriteRecipesConnectionEdge = IRecipeConnectionEdge & {
  __typename?: "QueryFavoriteRecipesConnectionEdge";
  cursor: Scalars["String"]["output"];
  node: Recipe;
};

export type QueryMyRecipesConnection = IRecipeConnection & {
  __typename?: "QueryMyRecipesConnection";
  edges: Array<QueryMyRecipesConnectionEdge>;
  exists: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  pageInfo: PageInfo;
};

export type QueryMyRecipesConnectionEdge = IRecipeConnectionEdge & {
  __typename?: "QueryMyRecipesConnectionEdge";
  cursor: Scalars["String"]["output"];
  node: Recipe;
};

export type QueryRecipesConnection = IRecipeConnection & {
  __typename?: "QueryRecipesConnection";
  edges: Array<QueryRecipesConnectionEdge>;
  exists: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  pageInfo: PageInfo;
};

export type QueryRecipesConnectionExistsArgs = {
  search?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryRecipesConnectionEdge = IRecipeConnectionEdge & {
  __typename?: "QueryRecipesConnectionEdge";
  cursor: Scalars["String"]["output"];
  node: Recipe;
};

export type Recipe = Node & {
  __typename?: "Recipe";
  allergens: Array<Allergen>;
  author?: Maybe<User>;
  category?: Maybe<Category>;
  cookTime?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  image?: Maybe<Image>;
  ingredients?: Maybe<Array<Ingredient>>;
  instructions?: Maybe<Array<Scalars["String"]["output"]>>;
  prepTime?: Maybe<Scalars["String"]["output"]>;
  /** Raw database ID */
  rawId: Scalars["ID"]["output"];
  servings?: Maybe<Scalars["Int"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
};

export type User = Node & {
  __typename?: "User";
  id: Scalars["ID"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  /** Raw database ID */
  rawId: Scalars["ID"]["output"];
};

type RecipeConnection_Connection_QueryFavoriteRecipesConnection_Fragment = {
  __typename?: "QueryFavoriteRecipesConnection";
  edges: Array<{
    __typename?: "QueryFavoriteRecipesConnectionEdge";
    node: { __typename?: "Recipe" } & {
      " $fragmentRefs"?: {
        Recipe_CommonDetailsFragment: Recipe_CommonDetailsFragment;
      };
    };
  }>;
} & {
  " $fragmentName"?: "RecipeConnection_Connection_QueryFavoriteRecipesConnection_Fragment";
};

type RecipeConnection_Connection_QueryMyRecipesConnection_Fragment = {
  __typename?: "QueryMyRecipesConnection";
  edges: Array<{
    __typename?: "QueryMyRecipesConnectionEdge";
    node: { __typename?: "Recipe" } & {
      " $fragmentRefs"?: {
        Recipe_CommonDetailsFragment: Recipe_CommonDetailsFragment;
      };
    };
  }>;
} & {
  " $fragmentName"?: "RecipeConnection_Connection_QueryMyRecipesConnection_Fragment";
};

type RecipeConnection_Connection_QueryRecipesConnection_Fragment = {
  __typename?: "QueryRecipesConnection";
  edges: Array<{
    __typename?: "QueryRecipesConnectionEdge";
    node: { __typename?: "Recipe" } & {
      " $fragmentRefs"?: {
        Recipe_CommonDetailsFragment: Recipe_CommonDetailsFragment;
      };
    };
  }>;
} & {
  " $fragmentName"?: "RecipeConnection_Connection_QueryRecipesConnection_Fragment";
};

export type RecipeConnection_ConnectionFragment =
  | RecipeConnection_Connection_QueryFavoriteRecipesConnection_Fragment
  | RecipeConnection_Connection_QueryMyRecipesConnection_Fragment
  | RecipeConnection_Connection_QueryRecipesConnection_Fragment;

type RecipeConnection_Pagination_QueryFavoriteRecipesConnection_Fragment = {
  __typename?: "QueryFavoriteRecipesConnection";
  pageInfo: {
    __typename?: "PageInfo";
    endCursor?: string | null;
    hasNextPage: boolean;
  };
} & {
  " $fragmentName"?: "RecipeConnection_Pagination_QueryFavoriteRecipesConnection_Fragment";
};

type RecipeConnection_Pagination_QueryMyRecipesConnection_Fragment = {
  __typename?: "QueryMyRecipesConnection";
  pageInfo: {
    __typename?: "PageInfo";
    endCursor?: string | null;
    hasNextPage: boolean;
  };
} & {
  " $fragmentName"?: "RecipeConnection_Pagination_QueryMyRecipesConnection_Fragment";
};

type RecipeConnection_Pagination_QueryRecipesConnection_Fragment = {
  __typename?: "QueryRecipesConnection";
  pageInfo: {
    __typename?: "PageInfo";
    endCursor?: string | null;
    hasNextPage: boolean;
  };
} & {
  " $fragmentName"?: "RecipeConnection_Pagination_QueryRecipesConnection_Fragment";
};

export type RecipeConnection_PaginationFragment =
  | RecipeConnection_Pagination_QueryFavoriteRecipesConnection_Fragment
  | RecipeConnection_Pagination_QueryMyRecipesConnection_Fragment
  | RecipeConnection_Pagination_QueryRecipesConnection_Fragment;

export type Recipe_CommonDetailsFragment = {
  __typename?: "Recipe";
  rawId: string;
  title?: string | null;
  description?: string | null;
  prepTime?: string | null;
  cookTime?: string | null;
  category?: { __typename?: "Category"; rawId: string; name: string } | null;
  image?: { __typename?: "Image"; src?: string | null } | null;
} & { " $fragmentName"?: "Recipe_CommonDetailsFragment" };

export type FavoriteRecipesQueryVariables = Exact<{
  first: Scalars["Int"]["input"];
  after?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type FavoriteRecipesQuery = {
  __typename?: "Query";
  recipes: {
    __typename?: "QueryFavoriteRecipesConnection";
    id: string;
    exists: boolean;
  } & {
    " $fragmentRefs"?: {
      RecipeConnection_Connection_QueryFavoriteRecipesConnection_Fragment: RecipeConnection_Connection_QueryFavoriteRecipesConnection_Fragment;
      RecipeConnection_Pagination_QueryFavoriteRecipesConnection_Fragment: RecipeConnection_Pagination_QueryFavoriteRecipesConnection_Fragment;
    };
  };
};

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type GetCategoriesQuery = {
  __typename?: "Query";
  categories: {
    __typename?: "QueryCategoriesConnection";
    edges: Array<{
      __typename?: "QueryCategoriesConnectionEdge";
      node: { __typename?: "Category"; rawId: string; name: string };
    }>;
  };
};

export type GetRecipeQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetRecipeQuery = {
  __typename?: "Query";
  recipe?:
    | ({
        __typename?: "Recipe";
        allergens: Array<Allergen>;
        servings?: number | null;
        instructions?: Array<string> | null;
        author?: {
          __typename?: "User";
          rawId: string;
          name?: string | null;
        } | null;
        ingredients?: Array<{
          __typename?: "Ingredient";
          id: string;
          name: string;
          amount: string;
          unit: string;
        }> | null;
      } & {
        " $fragmentRefs"?: {
          Recipe_CommonDetailsFragment: Recipe_CommonDetailsFragment;
        };
      })
    | null;
};

export type GetRecipesQueryVariables = Exact<{
  first: Scalars["Int"]["input"];
  after?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type GetRecipesQuery = {
  __typename?: "Query";
  recipes: {
    __typename?: "QueryRecipesConnection";
    id: string;
    exists: boolean;
  } & {
    " $fragmentRefs"?: {
      RecipeConnection_Connection_QueryRecipesConnection_Fragment: RecipeConnection_Connection_QueryRecipesConnection_Fragment;
      RecipeConnection_Pagination_QueryRecipesConnection_Fragment: RecipeConnection_Pagination_QueryRecipesConnection_Fragment;
    };
  };
};

export type RecipesForUserQueryQueryVariables = Exact<{
  first: Scalars["Int"]["input"];
  after?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type RecipesForUserQueryQuery = {
  __typename?: "Query";
  recipes: {
    __typename?: "QueryMyRecipesConnection";
    id: string;
    exists: boolean;
  } & {
    " $fragmentRefs"?: {
      RecipeConnection_Connection_QueryMyRecipesConnection_Fragment: RecipeConnection_Connection_QueryMyRecipesConnection_Fragment;
      RecipeConnection_Pagination_QueryMyRecipesConnection_Fragment: RecipeConnection_Pagination_QueryMyRecipesConnection_Fragment;
    };
  };
};

export const Recipe_CommonDetailsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "Recipe_commonDetails" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Recipe" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "rawId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "prepTime" } },
          { kind: "Field", name: { kind: "Name", value: "cookTime" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "category" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "rawId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "image" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "src" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<Recipe_CommonDetailsFragment, unknown>;
export const RecipeConnection_ConnectionFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RecipeConnection_connection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "IRecipeConnection" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "edges" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "node" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "Recipe_commonDetails" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "Recipe_commonDetails" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Recipe" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "rawId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "prepTime" } },
          { kind: "Field", name: { kind: "Name", value: "cookTime" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "category" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "rawId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "image" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "src" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RecipeConnection_ConnectionFragment, unknown>;
export const RecipeConnection_PaginationFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RecipeConnection_pagination" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "IRecipeConnection" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "pageInfo" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "endCursor" } },
                { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RecipeConnection_PaginationFragment, unknown>;
export const FavoriteRecipesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "FavoriteRecipes" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "first" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "after" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            alias: { kind: "Name", value: "recipes" },
            name: { kind: "Name", value: "favoriteRecipes" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "first" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "after" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "RecipeConnection_connection" },
                },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "RecipeConnection_pagination" },
                },
                { kind: "Field", name: { kind: "Name", value: "exists" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "Recipe_commonDetails" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Recipe" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "rawId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "prepTime" } },
          { kind: "Field", name: { kind: "Name", value: "cookTime" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "category" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "rawId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "image" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "src" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RecipeConnection_connection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "IRecipeConnection" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "edges" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "node" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "Recipe_commonDetails" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RecipeConnection_pagination" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "IRecipeConnection" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "pageInfo" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "endCursor" } },
                { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  FavoriteRecipesQuery,
  FavoriteRecipesQueryVariables
>;
export const GetCategoriesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetCategories" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "categories" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edges" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "node" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "rawId" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "name" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCategoriesQuery, GetCategoriesQueryVariables>;
export const GetRecipeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetRecipe" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "recipe" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "Recipe_commonDetails" },
                },
                { kind: "Field", name: { kind: "Name", value: "allergens" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "rawId" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "servings" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "ingredients" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "amount" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "unit" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "instructions" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "Recipe_commonDetails" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Recipe" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "rawId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "prepTime" } },
          { kind: "Field", name: { kind: "Name", value: "cookTime" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "category" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "rawId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "image" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "src" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetRecipeQuery, GetRecipeQueryVariables>;
export const GetRecipesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetRecipes" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "first" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "after" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "search" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "recipes" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "first" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "after" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "search" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "search" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "RecipeConnection_connection" },
                },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "RecipeConnection_pagination" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "exists" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "search" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "search" },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "Recipe_commonDetails" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Recipe" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "rawId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "prepTime" } },
          { kind: "Field", name: { kind: "Name", value: "cookTime" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "category" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "rawId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "image" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "src" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RecipeConnection_connection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "IRecipeConnection" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "edges" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "node" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "Recipe_commonDetails" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RecipeConnection_pagination" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "IRecipeConnection" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "pageInfo" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "endCursor" } },
                { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetRecipesQuery, GetRecipesQueryVariables>;
export const RecipesForUserQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "RecipesForUserQuery" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "first" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "after" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            alias: { kind: "Name", value: "recipes" },
            name: { kind: "Name", value: "myRecipes" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "first" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "first" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "after" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "after" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "RecipeConnection_connection" },
                },
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "RecipeConnection_pagination" },
                },
                { kind: "Field", name: { kind: "Name", value: "exists" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "Recipe_commonDetails" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Recipe" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "rawId" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "prepTime" } },
          { kind: "Field", name: { kind: "Name", value: "cookTime" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "category" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "rawId" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "image" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "src" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RecipeConnection_connection" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "IRecipeConnection" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "edges" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "node" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "Recipe_commonDetails" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "RecipeConnection_pagination" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "IRecipeConnection" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "pageInfo" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "endCursor" } },
                { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RecipesForUserQueryQuery,
  RecipesForUserQueryQueryVariables
>;
