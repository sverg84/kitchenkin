/* eslint-disable */
import type {
  Prisma,
  Recipe,
  Image,
  Category,
  Ingredient,
  Account,
  Session,
  User,
  VerificationToken,
} from "./prisma/client.js";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
export default interface PrismaTypes {
  Recipe: {
    Name: "Recipe";
    Shape: Recipe;
    Include: Prisma.RecipeInclude;
    Select: Prisma.RecipeSelect;
    OrderBy: Prisma.RecipeOrderByWithRelationInput;
    WhereUnique: Prisma.RecipeWhereUniqueInput;
    Where: Prisma.RecipeWhereInput;
    Create: {};
    Update: {};
    RelationName:
      | "category"
      | "ingredients"
      | "author"
      | "favoritedBy"
      | "image";
    ListRelations: "ingredients" | "favoritedBy";
    Relations: {
      category: {
        Shape: Category;
        Name: "Category";
        Nullable: false;
      };
      ingredients: {
        Shape: Ingredient[];
        Name: "Ingredient";
        Nullable: false;
      };
      author: {
        Shape: User;
        Name: "User";
        Nullable: false;
      };
      favoritedBy: {
        Shape: User[];
        Name: "User";
        Nullable: false;
      };
      image: {
        Shape: Image | null;
        Name: "Image";
        Nullable: true;
      };
    };
  };
  Image: {
    Name: "Image";
    Shape: Image;
    Include: Prisma.ImageInclude;
    Select: Prisma.ImageSelect;
    OrderBy: Prisma.ImageOrderByWithRelationInput;
    WhereUnique: Prisma.ImageWhereUniqueInput;
    Where: Prisma.ImageWhereInput;
    Create: {};
    Update: {};
    RelationName: "recipe";
    ListRelations: never;
    Relations: {
      recipe: {
        Shape: Recipe;
        Name: "Recipe";
        Nullable: false;
      };
    };
  };
  Category: {
    Name: "Category";
    Shape: Category;
    Include: Prisma.CategoryInclude;
    Select: Prisma.CategorySelect;
    OrderBy: Prisma.CategoryOrderByWithRelationInput;
    WhereUnique: Prisma.CategoryWhereUniqueInput;
    Where: Prisma.CategoryWhereInput;
    Create: {};
    Update: {};
    RelationName: "recipes";
    ListRelations: "recipes";
    Relations: {
      recipes: {
        Shape: Recipe[];
        Name: "Recipe";
        Nullable: false;
      };
    };
  };
  Ingredient: {
    Name: "Ingredient";
    Shape: Ingredient;
    Include: Prisma.IngredientInclude;
    Select: Prisma.IngredientSelect;
    OrderBy: Prisma.IngredientOrderByWithRelationInput;
    WhereUnique: Prisma.IngredientWhereUniqueInput;
    Where: Prisma.IngredientWhereInput;
    Create: {};
    Update: {};
    RelationName: "recipes";
    ListRelations: "recipes";
    Relations: {
      recipes: {
        Shape: Recipe[];
        Name: "Recipe";
        Nullable: false;
      };
    };
  };
  Account: {
    Name: "Account";
    Shape: Account;
    Include: Prisma.AccountInclude;
    Select: Prisma.AccountSelect;
    OrderBy: Prisma.AccountOrderByWithRelationInput;
    WhereUnique: Prisma.AccountWhereUniqueInput;
    Where: Prisma.AccountWhereInput;
    Create: {};
    Update: {};
    RelationName: "user";
    ListRelations: never;
    Relations: {
      user: {
        Shape: User;
        Name: "User";
        Nullable: false;
      };
    };
  };
  Session: {
    Name: "Session";
    Shape: Session;
    Include: Prisma.SessionInclude;
    Select: Prisma.SessionSelect;
    OrderBy: Prisma.SessionOrderByWithRelationInput;
    WhereUnique: Prisma.SessionWhereUniqueInput;
    Where: Prisma.SessionWhereInput;
    Create: {};
    Update: {};
    RelationName: "user";
    ListRelations: never;
    Relations: {
      user: {
        Shape: User;
        Name: "User";
        Nullable: false;
      };
    };
  };
  User: {
    Name: "User";
    Shape: User;
    Include: Prisma.UserInclude;
    Select: Prisma.UserSelect;
    OrderBy: Prisma.UserOrderByWithRelationInput;
    WhereUnique: Prisma.UserWhereUniqueInput;
    Where: Prisma.UserWhereInput;
    Create: {};
    Update: {};
    RelationName: "accounts" | "sessions" | "recipes" | "favorites";
    ListRelations: "accounts" | "sessions" | "recipes" | "favorites";
    Relations: {
      accounts: {
        Shape: Account[];
        Name: "Account";
        Nullable: false;
      };
      sessions: {
        Shape: Session[];
        Name: "Session";
        Nullable: false;
      };
      recipes: {
        Shape: Recipe[];
        Name: "Recipe";
        Nullable: false;
      };
      favorites: {
        Shape: Recipe[];
        Name: "Recipe";
        Nullable: false;
      };
    };
  };
  VerificationToken: {
    Name: "VerificationToken";
    Shape: VerificationToken;
    Include: never;
    Select: Prisma.VerificationTokenSelect;
    OrderBy: Prisma.VerificationTokenOrderByWithRelationInput;
    WhereUnique: Prisma.VerificationTokenWhereUniqueInput;
    Where: Prisma.VerificationTokenWhereInput;
    Create: {};
    Update: {};
    RelationName: never;
    ListRelations: never;
    Relations: {};
  };
}
export function getDatamodel(): PothosPrismaDatamodel {
  return JSON.parse(
    '{"datamodel":{"models":{"Recipe":{"fields":[{"type":"String","kind":"scalar","name":"id","isRequired":true,"isList":false,"hasDefaultValue":true,"isUnique":false,"isId":true,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"title","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"description","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"prepTime","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"cookTime","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"Int","kind":"scalar","name":"servings","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"instructions","isRequired":true,"isList":true,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"DateTime","kind":"scalar","name":"createdAt","isRequired":true,"isList":false,"hasDefaultValue":true,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"DateTime","kind":"scalar","name":"updatedAt","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":true},{"type":"Category","kind":"object","name":"category","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"CategoryToRecipe","relationFromFields":["categoryId"],"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"categoryId","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"Ingredient","kind":"object","name":"ingredients","isRequired":true,"isList":true,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"IngredientToRecipe","relationFromFields":[],"isUpdatedAt":false},{"type":"Allergen","kind":"enum","name":"allergens","isRequired":true,"isList":true,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"User","kind":"object","name":"author","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"AuthoredRecipes","relationFromFields":["authorId"],"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"authorId","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"User","kind":"object","name":"favoritedBy","isRequired":true,"isList":true,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"FavoritedRecipes","relationFromFields":[],"isUpdatedAt":false},{"type":"Image","kind":"object","name":"image","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"ImageToRecipe","relationFromFields":[],"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"imageId","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":true,"isId":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueIndexes":[]},"Image":{"fields":[{"type":"String","kind":"scalar","name":"id","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":true,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"src","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"recipeId","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":true,"isId":false,"isUpdatedAt":false},{"type":"Recipe","kind":"object","name":"recipe","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"ImageToRecipe","relationFromFields":["recipeId"],"isUpdatedAt":false}],"primaryKey":null,"uniqueIndexes":[]},"Category":{"fields":[{"type":"String","kind":"scalar","name":"id","isRequired":true,"isList":false,"hasDefaultValue":true,"isUnique":false,"isId":true,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"name","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":true,"isId":false,"isUpdatedAt":false},{"type":"Recipe","kind":"object","name":"recipes","isRequired":true,"isList":true,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"CategoryToRecipe","relationFromFields":[],"isUpdatedAt":false}],"primaryKey":null,"uniqueIndexes":[]},"Ingredient":{"fields":[{"type":"String","kind":"scalar","name":"id","isRequired":true,"isList":false,"hasDefaultValue":true,"isUnique":false,"isId":true,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"name","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"amount","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"unit","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"Recipe","kind":"object","name":"recipes","isRequired":true,"isList":true,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"IngredientToRecipe","relationFromFields":[],"isUpdatedAt":false}],"primaryKey":null,"uniqueIndexes":[{"name":null,"fields":["name","amount","unit"]}]},"Account":{"fields":[{"type":"String","kind":"scalar","name":"id","isRequired":true,"isList":false,"hasDefaultValue":true,"isUnique":false,"isId":true,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"userId","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"type","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"provider","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"providerAccountId","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"refresh_token","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"access_token","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"Int","kind":"scalar","name":"expires_at","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"token_type","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"scope","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"id_token","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"session_state","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"User","kind":"object","name":"user","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"AccountToUser","relationFromFields":["userId"],"isUpdatedAt":false}],"primaryKey":null,"uniqueIndexes":[{"name":null,"fields":["provider","providerAccountId"]}]},"Session":{"fields":[{"type":"String","kind":"scalar","name":"id","isRequired":true,"isList":false,"hasDefaultValue":true,"isUnique":false,"isId":true,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"sessionToken","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":true,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"userId","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"DateTime","kind":"scalar","name":"expires","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"User","kind":"object","name":"user","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"SessionToUser","relationFromFields":["userId"],"isUpdatedAt":false}],"primaryKey":null,"uniqueIndexes":[]},"User":{"fields":[{"type":"String","kind":"scalar","name":"id","isRequired":true,"isList":false,"hasDefaultValue":true,"isUnique":false,"isId":true,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"name","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"email","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":true,"isId":false,"isUpdatedAt":false},{"type":"DateTime","kind":"scalar","name":"emailVerified","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"image","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"password","isRequired":false,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"Account","kind":"object","name":"accounts","isRequired":true,"isList":true,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"AccountToUser","relationFromFields":[],"isUpdatedAt":false},{"type":"Session","kind":"object","name":"sessions","isRequired":true,"isList":true,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"SessionToUser","relationFromFields":[],"isUpdatedAt":false},{"type":"Recipe","kind":"object","name":"recipes","isRequired":true,"isList":true,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"AuthoredRecipes","relationFromFields":[],"isUpdatedAt":false},{"type":"Recipe","kind":"object","name":"favorites","isRequired":true,"isList":true,"hasDefaultValue":false,"isUnique":false,"isId":false,"relationName":"FavoritedRecipes","relationFromFields":[],"isUpdatedAt":false}],"primaryKey":null,"uniqueIndexes":[]},"VerificationToken":{"fields":[{"type":"String","kind":"scalar","name":"identifier","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false},{"type":"String","kind":"scalar","name":"token","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":true,"isId":false,"isUpdatedAt":false},{"type":"DateTime","kind":"scalar","name":"expires","isRequired":true,"isList":false,"hasDefaultValue":false,"isUnique":false,"isId":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueIndexes":[{"name":null,"fields":["identifier","token"]}]}}}}',
  );
}
