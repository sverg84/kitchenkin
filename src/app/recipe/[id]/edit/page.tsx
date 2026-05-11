import { auth } from "@/auth";
import { RecipeFormWrapper } from "@/components/recipe/form/recipe-form-wrapper";
import { getCategories, getRecipe } from "@/lib/graphql/server-fetch";
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

  const [categories, recipe] = await Promise.all([
    getCategories(),
    getRecipe(id),
  ]);

  if (!recipe) {
    notFound();
  }

  if (recipe.author?.rawId !== session.user.id) {
    redirect(`/recipe/${id}`);
  }

  return (
    <RecipeFormWrapper
      categories={categories}
      formMode="update"
      initialRecipe={recipe}
    />
  );
}
