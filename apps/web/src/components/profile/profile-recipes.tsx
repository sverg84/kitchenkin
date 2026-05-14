import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import RecipeList from "../recipe/list/recipe-list";

export default function ProfileRecipes() {
  const variables = { first: 24 };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Recipes</h2>
        <Button asChild={true}>
          <Link href="/recipe/new">
            <Plus className="mr-2 size-4" />
            Create Recipe
          </Link>
        </Button>
      </div>

      <RecipeList
        query="myRecipes"
        variables={variables}
        emptyState={
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-center text-muted-foreground">
                You haven&apos;t created any recipes yet.
              </p>
              <Button asChild={true}>
                <Link href="/recipe/new">
                  <Plus className="mr-2 size-4" />
                  Create Your First Recipe
                </Link>
              </Button>
            </CardContent>
          </Card>
        }
      />
    </>
  );
}
