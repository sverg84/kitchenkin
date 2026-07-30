"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useToggleFavorite } from "@/lib/query/hooks/use-recipes";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  recipeId: string;
  initialFavorited: boolean;
  className?: string;
  /** Compact icon button for cards; default is labeled for detail. */
  size?: "default" | "icon";
}

export function FavoriteButton({
  recipeId,
  initialFavorited,
  className,
  size = "default",
}: FavoriteButtonProps) {
  const { data: session, isPending } = authClient.useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const toggleFavorite = useToggleFavorite();

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  if (isPending) {
    return (
      <Button
        type="button"
        variant="outline"
        size={size === "icon" ? "icon" : "default"}
        className={className}
        disabled={true}
        aria-label="Favorite"
      >
        <Heart className="size-4" />
      </Button>
    );
  }

  if (!session?.user) {
    return (
      <Button
        type="button"
        variant="outline"
        size={size === "icon" ? "icon" : "default"}
        className={className}
        asChild={true}
      >
        <Link
          href="/login"
          aria-label="Sign in to favorite"
          onClick={(event) => event.stopPropagation()}
        >
          <Heart className="size-4" />
          {size === "default" ? <span>Favorite</span> : null}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size === "icon" ? "icon" : "default"}
      className={cn(className)}
      disabled={toggleFavorite.isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const previous = favorited;
        setFavorited(!previous);
        toggleFavorite.mutate(recipeId, {
          onSuccess: (result) => {
            setFavorited(result.favorited);
          },
          onError: () => {
            setFavorited(previous);
          },
        });
      }}
    >
      <Heart
        className={cn(
          "size-4",
          favorited && "fill-red-500 text-red-500",
        )}
      />
      {size === "default" ? (
        <span>{favorited ? "Favorited" : "Favorite"}</span>
      ) : null}
    </Button>
  );
}
