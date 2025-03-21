import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCategories } from "@/lib/graphql/server-fetch";
import { NewRecipeFormWrapper } from "@/components/recipe/form/new-form-wrapper";

export default async function NewRecipePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const categories = await getCategories();

  return <NewRecipeFormWrapper categories={categories} />;
}
