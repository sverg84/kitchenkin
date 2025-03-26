import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCategories } from "@/lib/graphql/server-fetch";
import { RecipeFormWrapper } from "@/components/recipe/form/recipe-form-wrapper";

export default async function NewRecipePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const categories = await getCategories();

  return <RecipeFormWrapper categories={categories} formMode="create" />;
}
