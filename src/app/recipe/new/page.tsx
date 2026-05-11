import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCategories } from "@/lib/graphql/server-fetch";
import { RecipeFormWrapper } from "@/components/recipe/form/recipe-form-wrapper";
import { Suspense } from "react";
import { RecipeFormFallback } from "@/components/suspense-fallbacks/recipe-form-fallback";

export default function NewRecipePage() {
  return (
    <Suspense fallback={<RecipeFormFallback heading="Create New Recipe" />}>
      <NewRecipePageContent />
    </Suspense>
  );
}

async function NewRecipePageContent() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const categories = await getCategories();

  return <RecipeFormWrapper categories={categories} formMode="create" />;
}
