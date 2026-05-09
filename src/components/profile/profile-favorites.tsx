import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import RecipeList from "../recipe/list/recipe-list";

export default function ProfileFavorites() {
  const variables = { first: 24 };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorite Recipes</CardTitle>
        <CardDescription>
          Recipes you&apos;ve saved as favorites will appear here.
        </CardDescription>
      </CardHeader>
      <RecipeList
        query="favorites"
        variables={variables}
        emptyState={
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-muted-foreground">
              You haven&apos;t saved any favorites yet.
            </p>
          </CardContent>
        }
      />
    </Card>
  );
}
