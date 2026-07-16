import { redirect } from "next/navigation";
import { auth } from "@/auth";
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

  return <RecipeFormWrapper formMode="create" />;
}
