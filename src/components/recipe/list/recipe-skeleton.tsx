import { memo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const RecipeCardSkeleton = memo(function RecipeCardSkeleton() {
  return (
    <Card className="h-92.5 overflow-hidden">
      <Skeleton className="w-full h-44 rounded-none" />
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="w-25 h-7" />
          <Skeleton className="w-12 h-5.5" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full h-6" />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-x-1 items-center">
          <Skeleton className="size-4" />
          <Skeleton className="w-18 h-5" />
        </div>
        <div className="flex gap-x-1 items-center">
          <Skeleton className="size-4" />
          <Skeleton className="w-35 h-5" />
        </div>
      </CardFooter>
    </Card>
  );
});

export default RecipeCardSkeleton;
