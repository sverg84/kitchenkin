import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { RecipeForm } from "@/components/recipe/recipe-form"
import { getCategories } from "@/lib/graphql/server-fetch"

export default async function NewRecipePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const categories = await getCategories()

  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Create New Recipe</h1>
      <RecipeForm categories={categories} />
    </div>
  )
}

