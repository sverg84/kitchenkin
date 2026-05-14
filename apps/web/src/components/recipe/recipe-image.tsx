import Image from "next/image";

export function RecipeImage({
  recipe,
  priority,
}: {
  recipe: { title?: string | null; image?: { src?: string | null } | null };
  priority?: boolean;
}) {
  return (
    <Image
      src={
        recipe.image?.src ??
        `https://placeholder.pics/svg/640x480/DEDEDE/555555-f4f5e4/${encodeURIComponent(recipe.title ?? "")}`
      }
      alt={recipe.title ?? "Recipe image"}
      fill
      className="object-cover"
      priority={priority}
      unoptimized={!recipe.image?.src}
    />
  );
}
