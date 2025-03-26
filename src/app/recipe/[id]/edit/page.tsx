import { auth } from "@/auth";
import { RecipeFormWrapper } from "@/components/recipe/form/recipe-form-wrapper";
import { getCategories, getRecipe } from "@/lib/graphql/server-fetch";
import { notFound, redirect, unauthorized } from "next/navigation";

export default async function EditRecipePage({
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

  if (recipe.authorId !== session.user.id) {
    unauthorized();
  }

  return (
    <RecipeFormWrapper
      categories={categories}
      formMode="update"
      initialRecipe={recipe}
    />
  );
}
