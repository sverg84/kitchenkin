import { Skeleton } from "@/components/ui/skeleton";

interface RecipeFormFallbackProps {
  heading: string;
}

export function RecipeFormFallback({
  heading,
}: Readonly<RecipeFormFallbackProps>) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{heading}</h1>

      <div className="space-y-6 rounded-lg border p-4 md:p-6">
        <div className="space-y-2">
          <Skeleton className="mx-auto h-4 w-16" />
          <Skeleton className="mx-auto h-10 w-full max-w-md" />
          <Skeleton className="mx-auto h-4 w-36" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-28 w-full" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-44" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
