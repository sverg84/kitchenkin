import { Category, Recipe } from "@/lib/generated/graphql/graphql";
import { RecipeForm } from "./recipe-form";

interface CreateProps {
  formMode: "create";
  initialRecipe?: never;
}

interface EditProps {
  formMode: "update";
  initialRecipe: Recipe;
}

type Pls = CreateProps | EditProps;

type Props = Readonly<
  {
    categories: Category[];
  } & Pls
>;

export function RecipeFormWrapper({
  categories,
  formMode,
  initialRecipe,
}: Props) {
  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">
        {formMode === "update" ? "Edit Recipe" : "Create New Recipe"}
      </h1>
      <RecipeForm
        categories={categories}
        initialRecipe={initialRecipe}
        type={formMode}
      />
    </div>
  );
}
