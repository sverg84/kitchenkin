import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import Image from "next/image";
import type { GqlRecipe } from "@/lib/generated/graphql";

interface RecipeCardProps {
  recipe: GqlRecipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video">
        <Image
          src={recipe.image || "/placeholder.svg"}
          alt={recipe.title}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{recipe.title}</h3>
          <Badge>{recipe.category?.name}</Badge>
        </div>
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
