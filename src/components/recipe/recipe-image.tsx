import type { Recipe } from "@/graphql";
import Image from "next/image";

export function RecipeImage({
  recipe,
  priority,
}: {
  recipe: Recipe;
  priority?: boolean;
}) {
  return (
    <Image
      src={
        recipe.image?.src ??
        `https://placeholder.pics/svg/640x480/DEDEDE/555555-f4f5e4/${recipe.title}`
      }
      alt={recipe.title!}
      fill
      className="object-cover"
      priority={priority}
      unoptimized={!recipe.image?.src}
    />
  );
}
