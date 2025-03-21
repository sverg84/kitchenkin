import type { RecipeEntity } from "@/lib/graphql/entities/recipe";
import { RecipeForm } from "./recipe-form";
import type { ApolloError } from "@apollo/client";

interface CreateProps {
  formMode: "create";
  initialRecipe?: never;
  onSubmit: (variables: unknown) => Promise<void>;
}

interface EditProps {
  formMode: "update";
  initialRecipe: RecipeEntity;
  onSubmit: (variables: unknown) => Promise<void>;
}

type Pls = CreateProps | EditProps;

type Props = Readonly<
  {
    categories: { id: string; name: string }[];
    mutationError: ApolloError | undefined;
  } & Pls
>;

export function RecipeFormWrapper({
  categories,
  formMode,
  initialRecipe,
  mutationError,
  onSubmit,
}: Props) {
  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">
        {formMode === "update" ? "Edit Recipe" : "Create New Recipe"}
      </h1>
      <RecipeForm
        categories={categories}
        initialRecipe={initialRecipe}
        mutationError={mutationError}
        type={formMode}
        onSubmit={onSubmit}
      />
    </div>
  );
}
