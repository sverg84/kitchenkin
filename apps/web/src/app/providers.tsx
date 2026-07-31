"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryKeys } from "@kk/shared";
import { type ReactNode, useEffect } from "react";

import { subscribeFavoriteChange } from "@/lib/query/favorite-sync";
import { getQueryClient } from "@/lib/query/get-query-client";

function FavoriteSyncListener() {
  const queryClient = getQueryClient();

  useEffect(() => {
    return subscribeFavoriteChange(() => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.all,
      });
    });
  }, [queryClient]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <FavoriteSyncListener />
      {children}
    </QueryClientProvider>
  );
}
