import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getRecipe } from "@/lib/graphql/server-fetch";
import { notFound } from "next/navigation";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="mx-auto px-4 py-8 max-w-7xl">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 size-4" />
          Back to recipes
        </Button>
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
          <p className="text-muted-foreground mb-4">{recipe.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>{recipe.category.name}</Badge>
            <div className="flex items-center">
              <Clock className="size-4 mr-1" />
              <span className="text-sm">Prep: {recipe.prepTime}</span>
            </div>
            <div className="flex items-center">
              <Clock className="size-4 mr-1" />
              <span className="text-sm">Cook: {recipe.cookTime}</span>
            </div>
            <div className="text-sm">Servings: {recipe.servings}</div>
          </div>
          <Separator className="my-6" />
          <div>
            <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient.id}>
                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                </li>
              ))}
            </ul>
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ol className="list-decimal pl-5 space-y-4">
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
