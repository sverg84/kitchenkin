import { memo } from "react";
import { cn } from "@/lib/utils";
import RecipeCardSkeleton from "./recipe-skeleton";

const SKELETON_INDICES = Array.from({ length: 24 }, (_, i) => i);

interface Props {
  className?: string;
}

const RecipeSkeletonList = memo(function RecipeSkeletonList({
  className,
}: Readonly<Props>) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className,
      )}
    >
      {SKELETON_INDICES.map((i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
});

export default RecipeSkeletonList;
