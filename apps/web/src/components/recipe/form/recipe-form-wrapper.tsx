import { RecipeForm } from "./recipe-form";
import type { RecipeDTO } from "@kk/shared";

interface CreateProps {
  formMode: "create";
  initialRecipe?: never;
}

interface EditProps {
  formMode: "update";
  initialRecipe: RecipeDTO;
}

type Pls = CreateProps | EditProps;

type Props = Readonly<
  {
    categories: Array<{ id: string; name: string }>;
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
