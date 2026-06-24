import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import FavoritesRecipeList from "../recipe/list/favorites-recipe-list";

export default function ProfileFavorites() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorite Recipes</CardTitle>
        <CardDescription>
          Recipes you&apos;ve saved as favorites will appear here.
        </CardDescription>
      </CardHeader>
      <FavoritesRecipeList
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
