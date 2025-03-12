"use client";

import type { RecipeEntity } from "@/lib/graphql/entities/recipe";
import type { ImageLoaderProps } from "next/image";
import Image from "next/image";

export function RecipeImage({ recipe }: { recipe: RecipeEntity }) {
  const imageLoader = ({ width }: ImageLoaderProps) => {
    const { image } = recipe;
    if (!image) {
      return "/placeholder.svg";
    }
    return width < 640
      ? image.small
      : width < 1024
      ? image.medium
      : width < 1280
      ? image.large
      : image.optimized;
  };
  return (
    <Image
      loader={imageLoader}
      src={recipe.image?.optimized || "/placeholder.svg"}
      alt={recipe.title}
      fill
      className="object-cover"
      priority
    />
  );
}
