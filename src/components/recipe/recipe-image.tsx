"use client";

import { Recipe } from "@/lib/generated/graphql/graphql";
import type { ImageLoaderProps } from "next/image";
import Image from "next/image";

export function RecipeImage({
  recipe,
  priority,
}: {
  recipe: Recipe;
  priority?: boolean;
}) {
  const imageLoader = ({ width }: ImageLoaderProps) => {
    const { image } = recipe;
    if (!image) {
      return `https://placeholder.pics/svg/640x480/DEDEDE/555555-f4f5e4/${recipe.title}`;
    }
    return width < 640
      ? image.small!
      : width < 1024
      ? image.medium!
      : width < 1280
      ? image.large!
      : image.optimized!;
  };
  return (
    <Image
      loader={imageLoader}
      src="https://placeholder.pics/svg/"
      alt={recipe.title!}
      fill
      className="object-cover"
      priority={priority}
    />
  );
}
