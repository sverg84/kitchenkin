import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listCategories } from "@kk/domain";
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

  const connection = await listCategories({ first: 100 });
  const categories = connection.edges.map((edge) => edge.node);

  return <RecipeFormWrapper categories={categories} formMode="create" />;
}
