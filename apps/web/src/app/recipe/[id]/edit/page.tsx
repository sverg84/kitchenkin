import { auth } from "@/auth";
import { RecipeFormWrapper } from "@/components/recipe/form/recipe-form-wrapper";
import { getRecipeById, listCategories } from "@kk/domain";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { RecipeFormFallback } from "@/components/suspense-fallbacks/recipe-form-fallback";

export default function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<RecipeFormFallback heading="Edit Recipe" />}>
      <EditRecipePageContent params={params} />
    </Suspense>
  );
}

async function EditRecipePageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const [categoriesConnection, recipe] = await Promise.all([
    listCategories({ first: 100 }),
    getRecipeById(id),
  ]);

  if (!recipe) {
    notFound();
  }

  if (recipe.author.id !== session.user.id) {
    redirect(`/recipe/${id}`);
  }

  const categories = categoriesConnection.edges.map((edge) => edge.node);

  return (
    <RecipeFormWrapper
      categories={categories}
      formMode="update"
      initialRecipe={recipe}
    />
  );
}
