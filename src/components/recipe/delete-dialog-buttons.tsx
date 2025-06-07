"use client";

import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { deleteRecipe } from "@/lib/prisma/server-actions";

interface Props {
  readonly recipeId: string;
}

export function RecipeDeleteDialogButtons({ recipeId }: Props) {
  const [loading, startTransition] = useTransition();

  const onClick = () => {
    startTransition(() => {
      deleteRecipe(recipeId);
    });
  };

  return (
    <>
      <DialogClose disabled={loading} asChild={true}>
        <Button disabled={loading} variant="outline">
          Cancel
        </Button>
      </DialogClose>
      <Button disabled={loading} variant="destructive" onClick={onClick}>
        Delete
      </Button>
    </>
  );
}
