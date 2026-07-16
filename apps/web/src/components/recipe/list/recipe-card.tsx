import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatRecipeTagLabel, type RecipeDTO } from "@kk/shared";
import { RecipeImage } from "../recipe-image";

interface RecipeCardProps {
  recipe: Pick<
    RecipeDTO,
    "id" | "title" | "description" | "prepTime" | "cookTime" | "tags" | "image"
  >;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video">
        <RecipeImage recipe={recipe} />
      </div>
      <CardHeader>
        <h3 className="text-lg font-semibold">{recipe.title}</h3>
        {recipe.tags.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <li key={tag}>
                <Badge>{formatRecipeTagLabel(tag)}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2">
          {recipe.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center">
          <Clock className="size-4 mr-1" />
          <span>Prep: {recipe.prepTime}</span>
        </div>
        <div className="flex items-center">
          <Clock className="size-4 mr-1" />
          <span>Cook: {recipe.cookTime}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
