import { ArrowLeft, Clock, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getRecipe } from "@/lib/graphql/server-fetch";
import { notFound } from "next/navigation";
import { RecipeImage } from "@/components/recipe/recipe-image";
import { auth } from "@/auth";
import { Allergen } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RecipeDeleteDialogButtons } from "@/components/recipe/delete-dialog-buttons";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [recipe, session] = await Promise.all([getRecipe(id), auth()]);

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
        <div className="flex flex-col gap-y-8">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <RecipeImage recipe={recipe} priority={true} />
          </div>
          {session?.user?.id === recipe.author?.rawId && (
            <div className="self-center flex gap-x-2">
              <Link href={`/recipe/${recipe.rawId}/edit`}>
                <Button variant="secondary">
                  <label>Edit</label>
                  <Edit />
                </Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild={true}>
                  <Button variant="destructive">
                    <Trash2 />
                  </Button>
                </DialogTrigger>
                <DialogContent showCloseButton={false}>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                  </DialogHeader>
                  This cannot be undone.
                  <DialogFooter>
                    <RecipeDeleteDialogButtons recipeId={recipe.rawId} />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <p className="mb-2">
            {recipe.author?.name ? `by ${recipe.author.name}` : ""}
          </p>
          <p className="text-muted-foreground mb-4">{recipe.description}</p>
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <Badge>{recipe.category?.name}</Badge>
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
          <ul className="flex flex-wrap gap-2 mb-4 items-center">
            {recipe.allergens?.map((allergen) => (
              <li className="flex" key={allergen}>
                <Badge variant="secondary">
                  {allergen === Allergen.TreeNuts ? "Tree Nuts" : allergen}
                </Badge>
              </li>
            ))}
          </ul>
          <Separator className="my-6" />
          <div>
            <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              {recipe.ingredients?.map((ingredient) => (
                <li key={ingredient.id}>
                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                </li>
              ))}
            </ul>
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ol className="list-decimal pl-5 space-y-4">
              {recipe.instructions?.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
