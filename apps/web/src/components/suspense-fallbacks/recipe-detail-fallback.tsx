import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function RecipeDetailFallback() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 size-4" />
          Back to recipes
        </Button>
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-y-8">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <div className="flex justify-center gap-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-9 w-4/5 max-w-md" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-16 w-full max-w-xl" />

          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <Skeleton className="my-6 h-px w-full" />
          <Skeleton className="h-7 w-40" />
          <div className="space-y-2 pl-5">
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-10/12" />
          </div>

          <Skeleton className="mt-6 h-7 w-36" />
          <div className="space-y-3 pl-5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </main>
  );
}
