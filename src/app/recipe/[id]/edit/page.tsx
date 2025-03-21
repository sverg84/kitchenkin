import { auth } from "@/auth";
import { EditRecipeFormWrapper } from "@/components/recipe/form/edit-form-wrapper";
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
    <EditRecipeFormWrapper categories={categories} initialRecipe={recipe} />
  );
}
